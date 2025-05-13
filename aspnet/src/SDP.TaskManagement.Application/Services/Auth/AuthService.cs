using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IUserManager _userManager;
    private readonly ITokenService _tokenService;

    public AuthService(IUserManager userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
    {
        if (await _userManager.DoesEmailExist(registerDto.Email))
        {
            throw new Exception("Email is already in use.");
        }

        if (await _userManager.DoesUsernameExist(registerDto.Name))
        {
            throw new Exception("Username is already in use.");
        }

        // Hashes the password making use of BCrypt. Ensure hashing algorithm later.
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Creates the new user entity with the input.
        var user = new User
        {
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            Username = registerDto.Name,
            FirstName = registerDto.Name,
            LastName = "",
            ProfilePhotoPath = "/default-profile.png"
        };

        await _userManager.CreateNewUser(user);

        // Return dto bearer token purposes.
        return UserMapper.ToDto(user);
    }

    public async Task<Option<string>> LoginAsync(LoginDto loginDto)
    {
        if (!await _userManager.DoesEmailExist(loginDto.Email))
        {
            return new() { Error = "Email does not exist." };
        }

        var user = await _userManager.GetUserByEmail(loginDto.Email);

        if (user == null)
        {
            return new() { Error = "User not found." };
        }

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return new() { Error = "Invalid password." };
        }

        return new()
        {
            Result = _tokenService.GenerateToken(user)
        };
    }
}
