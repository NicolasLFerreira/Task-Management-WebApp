using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Linq;

namespace SDP.TaskManagement.Application.Mappers;

public static class LabelMapper
{
    public static LabelDto ToDto(Label label)
    {
        if (label == null)
            return new LabelDto
            {
                Name = "Unknown",
                Color = "#CCCCCC"
            };
            
        return new LabelDto
        {
            Id = label.Id,
            Name = label.Name,
            Color = label.Color,
            BoardId = label.BoardId
        };
    }
    
    public static Label ToEntity(LabelDto dto)
    {
        return new Label
        {
            Id = dto.Id,
            Name = dto.Name,
            Color = dto.Color,
            BoardId = dto.BoardId,
            Board = null!
        };
    }
}
