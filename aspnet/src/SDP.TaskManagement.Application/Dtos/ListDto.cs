using System;

namespace SDP.TaskManagement.Application.Dtos;

public class ListDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public long BoardId { get; set; }
    public int Position { get; set; }
    public List<TaskItemDto>? TaskItems { get; set; }
}
