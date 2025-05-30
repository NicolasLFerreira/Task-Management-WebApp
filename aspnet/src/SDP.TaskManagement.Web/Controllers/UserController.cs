using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IRepository<User> _userRepository;

    public UserController(IRepository<User> userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetUserProfile()
    {
        var userId = GetCurrentUserId();
        
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound($"User with ID {userId} not found");
            
        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePhotoPath = user.ProfilePhotoPath,
            CreationDate = user.JoinDate
        };
        
        return Ok(userDto);
    }

    [HttpPut("profile")]
    public async Task<ActionResult> UpdateUserProfile([FromBody] UpdateProfileDto profileDto)
    {
        var userId = GetCurrentUserId();
        
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound($"User with ID {userId} not found");
            
        // Check if email is already in use by another user
        if (!string.IsNullOrEmpty(profileDto.Email) && profileDto.Email != user.Email)
        {
            var emailExists = await _userRepository.GetQueryable()
                .AnyAsync(u => u.Email == profileDto.Email && u.Id != userId);
                
            if (emailExists)
                return BadRequest("Email is already in use");
        }
        
        // Update user profile
        if (!string.IsNullOrEmpty(profileDto.FirstName))
            user.FirstName = profileDto.FirstName;
            
        if (!string.IsNullOrEmpty(profileDto.LastName))
            user.LastName = profileDto.LastName;
            
        if (!string.IsNullOrEmpty(profileDto.Email))
            user.Email = profileDto.Email;
        
        if (!string.IsNullOrEmpty(profileDto.Username))
            user.Username = profileDto.Username;
            
        var result = await _userRepository.UpdateAsync(user);
        
        if (!result)
            return BadRequest("Failed to update user profile");
            
        return NoContent();
    }

    [HttpPut("password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto passwordDto)
    {
        var userId = GetCurrentUserId();
        
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound($"User with ID {userId} not found");
            
        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(passwordDto.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect");
            
        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordDto.NewPassword);
        
        var result = await _userRepository.UpdateAsync(user);
        
        if (!result)
            return BadRequest("Failed to change password");
            
        return NoContent();
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<UserDto>>> SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query) || query.Length < 2)
            return BadRequest("Search query must be at least 2 characters long");
            
        var users = await _userRepository.GetQueryable()
            .Where(u => u.FirstName.Contains(query) || u.LastName.Contains(query) || u.Email.Contains(query))
            .Take(10)
            .ToListAsync();
            
        var userDtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            ProfilePhotoPath = u.ProfilePhotoPath,
            CreationDate = u.JoinDate
        }).ToList();
        
        return Ok(userDtos);
    }
    
    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return long.Parse(userIdClaim.Value);
    }
}

public class UpdateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Username { get; set; }
}

public class ChangePasswordDto
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}
