using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.Application.Abstractions;

namespace SDP.TaskManagement.Infrastructure.Repository;

public class Repository<TEntity, TId> : IRepository<TEntity, TId> where TEntity : class
{
    private readonly AppDbContext _dbContext;

    public Repository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(TEntity entity)
    {
        await _dbContext.Set<TEntity>().AddAsync(entity);
        _dbContext.SaveChanges();
    }

    public async Task AddRangeAsync(IEnumerable<TEntity> entities)
    {
        await _dbContext.Set<TEntity>().AddRangeAsync(entities);
        _dbContext.SaveChanges();
    }

    public async Task<TEntity?> GetByIdAsync(TId id)
    {
        return await _dbContext.Set<TEntity>().FindAsync(id);
    }

    public IQueryable<TEntity> GetQueryable()
    {
        return _dbContext.Set<TEntity>().AsQueryable();
    }
}
