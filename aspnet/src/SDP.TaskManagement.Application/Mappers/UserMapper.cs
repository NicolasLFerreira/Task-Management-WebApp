using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(User entity)
    {
        return new UserDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Email = entity.Email
        };
    }

    public static User ToEntity(UserDto dto)
    {
        return new User
        {
            Id = dto.Id,
            Name = dto.Name,
            Email = dto.Email
        };
    }
}
