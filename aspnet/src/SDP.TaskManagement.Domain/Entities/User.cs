using SDP.TaskManagement.Domain.Enums;

namespace SDP.TaskManagement.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }

    public UserRoles Role { get; set; }
}
