using System;

namespace SDP.TaskManagement.Application.Dtos;

public class LabelDto
{
    public long Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public long BoardId { get; set; }
}
