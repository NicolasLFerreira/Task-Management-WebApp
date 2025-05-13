using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;
using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly IRepository<User> _userRepository;
    private readonly IFileSystemService _fileSystemService;
    private readonly ILogger<UserProfileController> _logger;

    public UserProfileController(
        IRepository<User> userRepository,
        IFileSystemService fileSystemService,
        ILogger<UserProfileController> logger)
    {
        _userRepository = userRepository;
        _fileSystemService = fileSystemService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound();
            
        return Ok(user.ToDto());
    }

    [HttpPut]
    public async Task<ActionResult<UserDto>> UpdateProfile(UserDto userDto)
    {
        var userId = GetCurrentUserId();
        
        if (userDto.Id != userId)
            return BadRequest("User ID mismatch");
            
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound();
            
        // Update user properties
        user.FirstName = userDto.FirstName;
        user.LastName = userDto.LastName;
        user.Username = userDto.Username;
        
        // Don't update email or password here
        
        await _userRepository.UpdateAsync(user);
        
        _logger.LogInformation("User profile updated for user {UserId}", userId);
        
        return Ok(user.ToDto());
    }

    [HttpPost("profile-photo")]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound();
            
        try
        {
            // Delete old profile photo if exists
            if (!string.IsNullOrEmpty(user.ProfilePhotoPath))
            {
                var oldFileName = Path.GetFileName(user.ProfilePhotoPath);
                await _fileSystemService.DeleteProfilePhotoAsync(userId, oldFileName);
            }
            
            // Upload new profile photo
            var filePath = await _fileSystemService.UploadProfilePhotoAsync(userId, file);
            
            // Update user entity
            user.ProfilePhotoPath = filePath;
            await _userRepository.UpdateAsync(user);
            
            _logger.LogInformation("Profile photo uploaded for user {UserId}", userId);
            
            return Ok(new { filePath });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid profile photo upload attempt by user {UserId}", userId);
            return BadRequest(ex.Message);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "Profile photo upload failed for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, "File upload failed");
        }
    }

    [HttpGet("profile-photo")]
    public async Task<IActionResult> GetProfilePhoto()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound();
            
        if (string.IsNullOrEmpty(user.ProfilePhotoPath))
            return NotFound("No profile photo found");
            
        var fileName = Path.GetFileName(user.ProfilePhotoPath);
        var filePath = _fileSystemService.GetProfilePhotoPath(userId, fileName);
        
        if (filePath == null || !System.IO.File.Exists(filePath))
            return NotFound("Profile photo file not found");
            
        var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return File(fileStream, GetContentType(Path.GetExtension(fileName)), fileName);
    }

    [HttpDelete("profile-photo")]
    public async Task<IActionResult> DeleteProfilePhoto()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return NotFound();
            
        if (string.IsNullOrEmpty(user.ProfilePhotoPath))
            return NotFound("No profile photo found");
            
        var fileName = Path.GetFileName(user.ProfilePhotoPath);
        var deleted = await _fileSystemService.DeleteProfilePhotoAsync(userId, fileName);
        
        if (!deleted)
            _logger.LogWarning("Profile photo file not found on disk for user {UserId}", userId);
            
        // Update user entity
        user.ProfilePhotoPath = null;
        await _userRepository.UpdateAsync(user);
        
        _logger.LogInformation("Profile photo deleted for user {UserId}", userId);
        
        return NoContent();
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return userId;
    }

    private string GetContentType(string fileExtension)
    {
        return fileExtension?.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }
}
