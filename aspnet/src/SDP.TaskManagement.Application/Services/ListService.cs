using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Services;

public class ListService : IListService
{
    private readonly IRepository<List> _listRepository;
    private readonly IRepository<Board> _boardRepository;

    public ListService(IRepository<List> listRepository, IRepository<Board> boardRepository)
    {
        _listRepository = listRepository;
        _boardRepository = boardRepository;
    }

    public async Task<List?> CreateList(ListCreationDto listDto, long userId)
    {
        var list = new List
        {
            BoardId = listDto.BoardId,
            Title = listDto.Title,
            Position = listDto.Position,
        };

        var result = await _listRepository
            .AddAsync(list);

        return result
            ? list
            : null;
    }

    public async Task<List<List>?> CreateListRange(List<ListCreationDto> listRange, long userId)
    {
        if (listRange.Count == 0)
        {
            return [];
        }

        var entityList = listRange
            .Select(l => new List
            {
                Title = l.Title,
                Position = l.Position,
                BoardId = l.BoardId,
            });

        var result = await _listRepository
            .AddRangeAsync(entityList);

        return result
            ? [.. entityList]
            : null;
    }
}
