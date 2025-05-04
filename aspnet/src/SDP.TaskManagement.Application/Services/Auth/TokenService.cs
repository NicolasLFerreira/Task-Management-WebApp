using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols.Configuration;
using Microsoft.IdentityModel.Tokens;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SDP.TaskManagement.Application.Services.Auth;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        // Jwt claims. Read https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
        };

        // Jwt keys
        var secretKey = _configuration["Jwt:Key"];

        // Jwt key MUST be set for authentication to properly work.
        // If not set, it's an exceptional case. Exception must be thrown instead of making assumptions.
        if (secretKey == null)
        {
            throw new InvalidConfigurationException("Jwt key not set.");
        }

        // Gets the securityKey to be used for signing the Jwt with.
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Jwt duration
        var parseResult = int.TryParse(_configuration["Jwt:TokenLifetimeMinutes"], out var intDuration);

        // If token lifetime is not set or invalid, default to 60 minutes
        if (!parseResult || intDuration <= 0)
        {
            intDuration = 60; // Default to 60 minutes
        }

        // Create the Jwt.
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(intDuration),
            signingCredentials: signingCredentials
        );

        // Return serialised Jwt.
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
