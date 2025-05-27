using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class ListMapper
{
    public static ListDto ToDto(this List list)
    {
        return new ListDto
        {
            Id = list.Id,
            Title = list.Title,
            Position = list.Position,
            TaskCount = list.TaskItems?.Count ?? 0,
        };
    }
}
