using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Services;

public class BoardService : IBoardService
{
    private readonly IRepository<Board> _boardRepository;
    private readonly IListService _listService;

    public BoardService(IRepository<Board> boardRepository, IListService listService)
    {
        _boardRepository = boardRepository;
        _listService = listService;
    }

    public async Task<bool> CreateBoard(BoardCreationDto boardDto, long userId)
    {
        var board = new Board
        {
            Title = boardDto.Title,
            Description = boardDto.Description,
            OwnerId = userId,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };

        var result = await _boardRepository.AddAsync(board);

        if (result)
        {
            var listResult = await _listService.CreateListRange(boardDto.Lists, userId);

            result = listResult != null;
        }

        return result;
    }
}
