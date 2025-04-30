using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Handles generation of the JSON Web Tokens (JWT). Read https://auth0.com/docs/secure/tokens/json-web-tokens
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates Jwt for the specific <see cref="User"/> and appsettings.json Jwt configs
    /// </summary>
    string GenerateToken(User user);
}
