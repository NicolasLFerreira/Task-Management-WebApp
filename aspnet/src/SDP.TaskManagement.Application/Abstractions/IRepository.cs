using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Interface for database access abstraction. Should be used when performing CRUD operations on tables.
/// </summary>
public interface IRepository<TEntity> where TEntity : Entity
{
    /// <summary>
    /// Adds a single entity.
    /// </summary>
    /// <returns>
    /// Whether task was successful.
    /// </returns>
    Task<bool> AddAsync(TEntity entity);
    /// <summary>
    /// Adds many entities.
    /// </summary>
    /// <returns>
    /// Whether task was successful.
    /// </returns>
    Task<bool> AddRangeAsync(IEnumerable<TEntity> entities);
    /// <summary>
    /// Gets a single entity by its <see cref="Entity.Id"/>.
    /// </summary>
    Task<TEntity?> GetByIdAsync(Guid id);
    /// <summary>
    /// Retrieves a queryable of the whole database table for the respective <see cref="Entity"/>
    /// </summary>
    IQueryable<TEntity> GetQueryable();
    /// <summary>
    /// Updates a single entity.
    /// </summary>
    /// <returns>
    /// Whether task was successful.
    /// </returns>
    Task<bool> UpdateAsync(TEntity entity);
    /// <summary>
    /// Deletes a single entity.
    /// </summary>
    /// <returns>
    /// Whether task was successful.
    /// </returns>
    Task<bool> DeleteAsync(Guid id);
}
