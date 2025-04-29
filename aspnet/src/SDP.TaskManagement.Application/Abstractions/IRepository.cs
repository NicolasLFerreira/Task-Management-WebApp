namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Database access abstraction.
/// </summary>
public interface IRepository<TEntity, TId> where TEntity : class
{
    Task AddAsync(TEntity entity);
    Task AddRangeAsync(IEnumerable<TEntity> entities);
    Task<TEntity?> GetByIdAsync(TId id);
    IQueryable<TEntity> GetQueryable();
}
