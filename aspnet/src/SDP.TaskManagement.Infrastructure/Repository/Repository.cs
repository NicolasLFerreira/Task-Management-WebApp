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
        await Set.AnyAsync(e => e.Id == entity.Id);

        await Set
            .AddAsync(entity);

        await _dbContext
            .SaveChangesAsync();

        return true;
    }

    public async Task<bool> AddRangeAsync(IEnumerable<TEntity> entities)
    {
        await Set
            .AddRangeAsync(entities);

        await _dbContext
            .SaveChangesAsync();
         
        return true;
    }

    public async Task<TEntity?> GetByIdAsync(Guid id)
    {
        return await Set
            .FindAsync(id);
    }

    public IQueryable<TEntity> GetQueryable()
    {
        return Set
            .AsQueryable();
    }

    public async Task<bool> UpdateAsync(TEntity entity)
    {
        Set
            .Update(entity);

        await _dbContext
            .SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        await Set
            .Where(user => user.Id.Equals(id))
            .ExecuteDeleteAsync();

        return true;
    }
}
