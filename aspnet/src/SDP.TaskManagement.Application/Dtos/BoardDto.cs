using System;
using System.Collections.Generic;

namespace SDP.TaskManagement.Application.Dtos;

public class BoardDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime CreationDate { get; set; }
    public long OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public List<ListDto>? Lists { get; set; }
    public List<BoardMemberDto>? Members { get; set; }
}
