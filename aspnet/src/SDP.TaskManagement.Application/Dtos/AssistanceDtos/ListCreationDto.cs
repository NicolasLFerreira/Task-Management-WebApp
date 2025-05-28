namespace SDP.TaskManagement.Application.Dtos.AssistanceDtos;

public sealed class ListCreationDto
{
    public required string Title { get; set; }

    public required int Position { get; set; }

    public long BoardId { get; set; }
}