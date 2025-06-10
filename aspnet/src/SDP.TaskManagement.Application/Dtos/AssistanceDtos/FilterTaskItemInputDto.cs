using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Dtos.AssistanceDtos;

public sealed class FilterTaskItemInputDto()
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public TaskItemPriority? Priority { get; set; }
}