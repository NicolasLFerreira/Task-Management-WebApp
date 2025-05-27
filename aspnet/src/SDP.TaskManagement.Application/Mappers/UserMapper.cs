using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(this User user)
    {       
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePhotoPath = user.ProfilePhotoPath,
            CreationDate = user.JoinDate,
            LastLogin = user.LastLogin
        };
    }
}
