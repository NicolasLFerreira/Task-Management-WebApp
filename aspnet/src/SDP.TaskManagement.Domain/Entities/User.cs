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

    public DateTime JoinDate { get; set; }

    public DateTime? LastLogin { get; set; }
    
    // Navigation properties

    public List<TaskItem>? OwnedTasks { get; set; }

    public List<TaskAssignee>? AssignedTasks { get; set; }

    public List<Board>? OwnedBoards { get; set; }

    public List<BoardMember>? BoardMemberships { get; set; }

    public List <Comment>? Comments { get; set; }

    public List<Notification>? Notifications { get; set; }
}
