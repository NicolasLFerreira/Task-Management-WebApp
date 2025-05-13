using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Linq;

namespace SDP.TaskManagement.Application.Mappers;

public static class BoardMapper
{
    public static BoardDto ToDto(Board board)
    {
        if (board == null)
            return new BoardDto
            {
                Title = "Unknown",
                Description = "Unknown",
                CreationDate = DateTime.UtcNow
            };
            
        return new BoardDto
        {
            Id = board.Id,
            Title = board.Title ?? "Untitled Board",
            Description = board.Description ?? "",
            CreationDate = board.CreationDate,
            OwnerId = board.OwnerId,
            OwnerName = board.Owner?.Username
        };
    }
    
    public static Board ToEntity(BoardDto dto)
    {
        return new Board
        {
            Id = dto.Id,
            Title = dto.Title,
            Description = dto.Description,
            CreationDate = dto.CreationDate,
            OwnerId = dto.OwnerId,
            Owner = null!
        };
    }
}
