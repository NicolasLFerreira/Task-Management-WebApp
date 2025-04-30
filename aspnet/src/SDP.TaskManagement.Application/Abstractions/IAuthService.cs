using SDP.TaskManagement.Application.Dtos;

namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Service for handling user registration and login.
/// </summary>
public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterDto registerDto);
    Task<Option<string>> LoginAsync(LoginDto loginDto);
}
