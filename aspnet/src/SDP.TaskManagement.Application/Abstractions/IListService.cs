using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Abstractions;

public interface IListService
{
    /// <summary>
    /// Creates a new list at the top of a board.
    /// </summary>
    Task<List?> CreateList(ListCreationDto list, long userId);

    /// <summary>
    /// Creates multiple new lists at the top of a board.
    /// </summary>
    Task<List<List>?> CreateListRange(List<ListCreationDto> listRange, long userId);
}
