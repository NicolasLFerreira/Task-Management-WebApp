using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class BoardMapper
{
    public static BoardDto ToDto(this Board board)
    {
        return new BoardDto
        {
            Id = board.Id,
            Title = board.Title,
            Description = board.Description,
            CreatedAt = board.CreatedAt,
            OwnerUsername = board.Owner?.Username ?? ""
        };
    }
}
