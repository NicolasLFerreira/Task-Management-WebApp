using System;
using System.Collections.Generic;
using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class User : Entity
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? ProfilePhotoPath { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime? LastLogin { get; set; }
    
    // Navigation properties
    public ICollection<TaskItem>? OwnedTasks { get; set; }
    public ICollection<TaskAssignee>? AssignedTasks { get; set; }
    public ICollection<Board>? OwnedBoards { get; set; }
    public ICollection<BoardMember>? BoardMemberships { get; set; }
    public ICollection<Comment>? Comments { get; set; }
    public ICollection<Notification>? Notifications { get; set; }
}
