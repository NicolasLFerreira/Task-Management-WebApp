using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Base;
using SDP.TaskManagement.Infrastructure.Persistence;

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

    public async Task<bool> AddAsync(TEntity entity)
    {
        var exists = await Set
            .AnyAsync(e => e.Id == entity.Id);

        if (exists)
        {
            return false;
        }

        var a = await Set
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
        var exists = await Set.AnyAsync(e => e.Id == id);

        if (exists)
        {
            return false;
        }

        await Set
            .Where(e => e.Id == id)
            .ExecuteDeleteAsync();

        return true;
    }
}
