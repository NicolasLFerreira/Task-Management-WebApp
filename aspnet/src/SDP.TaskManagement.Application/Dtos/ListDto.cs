namespace SDP.TaskManagement.Application.Dtos;

public class ListDto
{
    public long Id { get; set; }

    public required string Title { get; set; }

    public int Position { get; set; }
}
