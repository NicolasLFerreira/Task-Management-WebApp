using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Linq;

namespace SDP.TaskManagement.Application.Mappers;

public static class ListMapper
{
    public static ListDto ToDto(List list)
    {
        if (list == null)
            return new ListDto
            {
                Title = "Unknown"
            };
            
        return new ListDto
        {
            Id = list.Id,
            Title = list.Title,
            BoardId = list.BoardId,
            Position = list.Position
        };
    }
    
    public static List ToEntity(ListDto dto)
    {
        return new List
        {
            Id = dto.Id,
            Title = dto.Title,
            BoardId = dto.BoardId,
            Position = dto.Position,
            Board = null!
        };
    }
}
