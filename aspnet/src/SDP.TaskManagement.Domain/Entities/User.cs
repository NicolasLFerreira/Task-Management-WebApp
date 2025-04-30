using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class User : Entity
{
    public string Name { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public List<TaskItem>? OwnedTaskItems { get; set; }
}