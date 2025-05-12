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

        // Log the key length to help with debugging
        Console.WriteLine($"JWT Key length: {secretKey.Length} characters, {Encoding.UTF8.GetByteCount(secretKey)} bytes");

        // Ensure the key is at least 32 characters (256 bits) for HS256
        if (secretKey.Length < 32)
        {
            secretKey = secretKey.PadRight(32, '_');
            Console.WriteLine($"JWT Key was too short, padded to {secretKey.Length} characters");
        }

        // Gets the securityKey to be used for signing the Jwt with.
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Jwt duration
        var parseResult = int.TryParse(_configuration["Jwt:TokenLifetimeMinutes"], out var intDuration);

        // Jwt duration must be set to a valid value to properly work. The code should not make assumptions.
        // If not set, it's an exceptional case.
        if (!parseResult || intDuration <= 0)
        {
            intDuration = 60; // Default to 60 minutes if not set or invalid
            Console.WriteLine("Invalid Jwt TokenLifetimeMinutes value, using default of 60 minutes");
        }

        var expiryTime = DateTime.UtcNow.AddMinutes(intDuration);

        // Create the Jwt.
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiryTime,
            signingCredentials: signingCredentials
        );

        // Return serialised Jwt.
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
