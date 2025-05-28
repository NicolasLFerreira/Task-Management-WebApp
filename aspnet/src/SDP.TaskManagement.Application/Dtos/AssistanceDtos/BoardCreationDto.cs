namespace SDP.TaskManagement.Application.Dtos.AssistanceDtos;

public sealed class BoardCreationDto
{
    public required string Title { get; set; }

    public required string Description { get; set; }

    public required List<ListCreationDto> Lists { get; set; }
    public required List<long> BoardMembers { get; set; }
}
