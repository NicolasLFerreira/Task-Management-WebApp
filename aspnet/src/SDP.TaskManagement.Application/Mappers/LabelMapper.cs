using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class LabelMapper
{
    public static LabelDto ToDto(Label label)
    {       
        return new LabelDto
        {
            Id = label.Id,
            Name = label.Name,
            Color = label.Color,
            BoardId = label.BoardId
        };
    }
}
