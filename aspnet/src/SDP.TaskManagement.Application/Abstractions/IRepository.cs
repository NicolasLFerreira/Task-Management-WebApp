using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Interface for database access abstraction. Should be used when performing CRUD operations on tables.
/// </summary>
public interface IRepository<TEntity> where TEntity : Entity
{
    Task<bool> AddAsync(TEntity entity);
    Task<bool> AddRangeAsync(IEnumerable<TEntity> entities);
    Task<TEntity?> GetByIdAsync(Guid id);
    IQueryable<TEntity> GetQueryable();
    Task<bool> UpdateAsync(TEntity entity);
    Task<bool> DeleteAsync(Guid id);
}
