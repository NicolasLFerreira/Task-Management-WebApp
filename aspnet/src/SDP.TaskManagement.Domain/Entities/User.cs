using SDP.TaskManagement.Domain.Enums;

namespace SDP.TaskManagement.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public UserRoles Role { get; set; }

    public List<TaskItem> CreatedTaskItems { get; set; }

    public List<TaskItem> AssignedTaskItems { get; set; }
}
