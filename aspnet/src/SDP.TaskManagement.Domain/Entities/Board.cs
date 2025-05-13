using SDP.TaskManagement.Domain.Base;
using System;
using System.Collections.Generic;

namespace SDP.TaskManagement.Domain.Entities;

public class Board : Entity
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime CreationDate { get; set; }
    public long OwnerId { get; set; }
    public DateTime LastModifiedDate { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<List> Lists { get; set; } = new List<List>();
    public ICollection<BoardMember> Members { get; set; } = new List<BoardMember>();
}
