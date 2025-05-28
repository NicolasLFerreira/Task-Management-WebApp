namespace SDP.TaskManagement.Application.Dtos.AssistanceDtos;

public sealed class ReorderListsDto
{
    public long BoardId { get; set; }
    public List<long> ListIds { get; set; } = [];
}
