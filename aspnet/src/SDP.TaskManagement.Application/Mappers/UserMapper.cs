using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(this User user)
    {
        if (user == null)
            return new UserDto
            {
                Username = "Unknown",
                Email = "Unknown",
                FirstName = "Unknown",
                LastName = "Unknown",
                ProfilePhotoPath = "Unknown",
                CreationDate = DateTime.UtcNow
            };
            
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePhotoPath = user.ProfilePhotoPath,
            CreationDate = user.CreationDate,
            LastLogin = user.LastLogin
        };
    }
    
    public static User ToEntity(this UserDto dto, bool includePassword = false)
    {
        if (dto == null)
            return new User
            {
                Username = "Unknown",
                Email = "Unknown",
                FirstName = "Unknown",
                LastName = "Unknown",
                ProfilePhotoPath = "Unknown",
                PasswordHash = "Unknown"
            };
            
        var user = new User
        {
            Id = dto.Id,
            Username = dto.Username,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            ProfilePhotoPath = dto.ProfilePhotoPath,
            CreationDate = dto.CreationDate,
            LastLogin = dto.LastLogin,
            PasswordHash = "Unknown" // This should be set separately with proper hashing
        };
        
        return user;
    }
    
    public static void UpdateFromDto(this User user, UserDto dto, bool updatePassword = false)
    {
        if (user == null || dto == null)
            return;
            
        user.Username = dto.Username;
        user.Email = dto.Email;
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.ProfilePhotoPath = dto.ProfilePhotoPath;
        
        // Don't update password here - should be handled separately with proper hashing
    }
}
