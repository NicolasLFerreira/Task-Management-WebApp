namespace SDP.TaskManagement.Application.Dtos;

public class BoardDto
{
    public long Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    // For UI
    public required string OwnerUsername { get; set; }
}
