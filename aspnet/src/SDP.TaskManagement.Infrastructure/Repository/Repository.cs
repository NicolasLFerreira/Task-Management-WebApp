using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Base;
using SDP.TaskManagement.Infrastructure.Persistence;

using System.Linq.Expressions;

namespace SDP.TaskManagement.Infrastructure.Repository;

public class Repository<TEntity> : IRepository<TEntity>
    where TEntity : Entity
{
    private readonly AppDbContext _dbContext;

    private DbSet<TEntity> Set => _dbContext.Set<TEntity>();

    public Repository(AppDbContext dbContext)
    {
        _dbContext = dbContext;

    }

    public async Task<bool> Exists(long id)
    {
        return await Set
            .AnyAsync(e => e.Id == id);
    }

    public async Task<bool> AddAsync(TEntity entity)
    {
        // Generate a new ID if it's 0 (default value)
        if (entity.Id == 0)
        {
            // Find the maximum ID and add 1, or start with 1 if no entities exist
            var maxId = await Set.MaxAsync(e => (long?)e.Id) ?? 0;
            entity.Id = maxId + 1;
        }
        else if (await Exists(entity.Id))
        {
            // If the ID already exists, return false
            return false;
        }

        await Set
            .AddAsync(entity);

        var result = await _dbContext
            .SaveChangesAsync();

        return result == 1;
    }

    public async Task<bool> AddRangeAsync(IEnumerable<TEntity> entities)
    {
        await Set
            .AddRangeAsync(entities);

        await _dbContext
            .SaveChangesAsync();

        return true;
    }

    public async Task<TEntity?> GetByIdAsync(long id)
    {
        return await Set
            .FindAsync(id);
    }

    public async Task<TEntity?> GetByIdAsyncWithNavigation(long id, params Expression<Func<TEntity, object>>[] expressions)
    {
        IQueryable<TEntity> query = Set;

        foreach (var expression in expressions)
        {
            query.Include(expression);
        }

        return await query
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public IQueryable<TEntity> GetQueryable()
    {
        return Set
            .AsQueryable();
    }

    public async Task<bool> UpdateAsync(TEntity item)
    {
        var entity = await Set.FirstOrDefaultAsync(e => e.Id == item.Id);

        if (entity == null)
        {
            return false;
        }

        Set
            .Entry(entity)
            .CurrentValues
            .SetValues(item);

        await _dbContext
            .SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        if (!await Exists(id))
        {
            return false;
        }

        await Set
            .Where(e => e.Id == id)
            .ExecuteDeleteAsync();

        return true;
    }
}
