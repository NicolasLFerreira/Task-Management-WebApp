using System.Linq.Expressions;

namespace SDP.TaskManagement.Infrastructure.Extensions;

public static class QueryableExtensions
{
    public static IQueryable<T> WhereIf<T>(this IQueryable<T> queryable, bool condition, Expression<Func<T, bool>> predicate)
    {
        return condition
            ? queryable.Where(predicate)
            : queryable;
    }
}
