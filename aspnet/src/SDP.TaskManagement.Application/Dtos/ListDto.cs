namespace SDP.TaskManagement.Application.Dtos;

public class ListDto
{
    public required long Id { get; set; }

    public required string Title { get; set; }

    public required int Position { get; set; }

    public required int TaskCount { get; set; }
}
