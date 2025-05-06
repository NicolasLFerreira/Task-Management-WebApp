namespace SDP.TaskManagement.Domain.Base;

/// <summary>
/// Base entity class for normalising the usage of an Id
/// </summary>
public class Entity
{
    public required Guid Id { get; set; }
}
