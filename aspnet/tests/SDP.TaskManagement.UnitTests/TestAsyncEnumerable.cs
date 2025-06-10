using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Query;

namespace SDP.TaskManagement.UnitTests
{
    public interface IAsyncQueryProvider : IQueryProvider
    {
        TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default);
    }

    public class TestAsyncEnumerable<T> : IAsyncEnumerable<T>, IQueryable<T>
    {
        private readonly IEnumerable<T> _enumerable;

        public TestAsyncEnumerable(IEnumerable<T> enumerable)
        {
            _enumerable = enumerable;
        }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            return new TestAsyncEnumerator<T>(_enumerable.GetEnumerator());
        }

        public IEnumerator<T> GetEnumerator() => _enumerable.GetEnumerator();
        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
        public Type ElementType => typeof(T);
        public Expression Expression => _enumerable.AsQueryable().Expression;
        public IQueryProvider Provider => new TestAsyncQueryProvider<T>(_enumerable.AsQueryable().Provider);
    }

    public class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _enumerator;

        public TestAsyncEnumerator(IEnumerator<T> enumerator)
        {
            _enumerator = enumerator;
        }

        public T Current => _enumerator.Current;

        public ValueTask<bool> MoveNextAsync() => new ValueTask<bool>(_enumerator.MoveNext());

        public ValueTask DisposeAsync()
        {
            _enumerator.Dispose();
            return ValueTask.CompletedTask;
        }
    }

    public class TestAsyncQueryProvider<T> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;

        public TestAsyncQueryProvider(IQueryProvider inner)
        {
            _inner = inner;
        }

        public IQueryable CreateQuery(Expression expression) => _inner.CreateQuery(expression);
        public IQueryable<TElement> CreateQuery<TElement>(Expression expression) => new TestAsyncEnumerable<TElement>(_inner.CreateQuery<TElement>(expression).AsEnumerable());
        public object? Execute(Expression expression) => _inner.Execute(expression);
        public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);
        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
        {
            return Execute<TResult>(expression);
        }
    }
}