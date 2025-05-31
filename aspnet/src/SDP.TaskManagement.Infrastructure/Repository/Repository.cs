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
            query = query.Include(expression); // CORRECTED: Reassign the result of Include
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

        _dbContext
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
