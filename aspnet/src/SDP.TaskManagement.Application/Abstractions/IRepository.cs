using SDP.TaskManagement.Domain.Base;

using System.Linq.Expressions;

namespace SDP.TaskManagement.Application.Abstractions;

/// <summary>
/// Interface for database access abstraction. Should be used when performing CRUD operations on tables.
/// </summary>
public interface IRepository<TEntity> where TEntity : Entity
{
    /// <summary>
    /// Quickly checks if an entity with the specified <see cref="Entity.Id"/>> exists.
    /// </summary>
    /// <returns>Whether it exists or not.</returns>
    Task<bool> Exists(long id);
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
    Task<TEntity?> GetByIdAsync(long id);
    /// <summary>
    /// Gets a single entity by its Id with injected expressions for navigation inclusion.
    /// </summary>
    Task<TEntity?> GetByIdAsyncWithNavigation(long id, params Expression<Func<TEntity, object>>[] expressions);
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
    Task<bool> DeleteAsync(long id);
}
