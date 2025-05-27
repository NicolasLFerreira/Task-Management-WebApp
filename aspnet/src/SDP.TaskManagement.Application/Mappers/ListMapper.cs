using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Linq;

namespace SDP.TaskManagement.Application.Mappers;

public static class ListMapper
{
    public static ListDto ToDto(List list)
    {            
        return new ListDto
        {
            Id = list.Id,
            Title = list.Title,
            BoardId = list.BoardId,
            Position = list.Position
        };
    }
}
