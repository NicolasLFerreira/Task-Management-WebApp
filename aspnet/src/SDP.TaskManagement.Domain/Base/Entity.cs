namespace SDP.TaskManagement.Domain.Base;

/// <summary>
/// Base entity class for normalising the usage of an Id
/// </summary>
public class Entity<TId>
{
    public required TId Id { get; set; }
}

/// <summary>
/// Wrapper class for implicitly using GUID
/// </summary>
public class Entity : Entity<Guid> { }
