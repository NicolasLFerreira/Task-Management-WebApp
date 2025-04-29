namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Interface for database access abstraction. Should be used when performing CRUD operations on tables.
/// </summary>
public interface IRepository<TEntity, TId> where TEntity : class
{
    Task AddAsync(TEntity entity);
    Task AddRangeAsync(IEnumerable<TEntity> entities);
    Task<TEntity?> GetByIdAsync(TId id);
    IQueryable<TEntity> GetQueryable();
}
