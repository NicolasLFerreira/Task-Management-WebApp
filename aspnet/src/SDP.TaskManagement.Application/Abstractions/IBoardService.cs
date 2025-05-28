using SDP.TaskManagement.Application.Dtos.AssistanceDtos;

namespace SDP.TaskManagement.Application.Abstractions;

public interface IBoardService
{
    Task<bool> CreateBoard(BoardCreationDto boardDto, long userId);
}
