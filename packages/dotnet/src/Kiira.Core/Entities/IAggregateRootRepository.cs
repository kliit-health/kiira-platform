namespace Kiira.Core.Entities;

/// <summary>
/// Defines a repository containing methods to implement get and save functionality for an aggregate root's bounded context.
/// </summary>
/// <typeparam name="TAggregateRoot">The type of aggregate.</typeparam>
/// <typeparam name="TAggregateRootId">The type of identifier of the aggregate.</typeparam>
public interface IAggregateRootRepository<TAggregateRoot, in TAggregateRootId>
	where TAggregateRoot : IAggregateRoot<TAggregateRootId>
{
	/// <summary>
	/// Retrieves an aggregate with the given identifier from data storage.
	/// </summary>
	/// <param name="id">The unique identifier of the aggregate.</param>
	/// <param name="cancellationToken">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
	/// <returns>An aggregate root, identified by the given id.</returns>
	Task<TAggregateRoot> GetAsync(TAggregateRootId id, CancellationToken cancellationToken = default);
	
	/// <summary>
	/// Persists the state of the given aggregate (and its child entities) to data storage.
	/// </summary>
	/// <param name="aggregate">The aggregate to persist.</param>
	/// <param name="cancellationToken">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
	Task SaveAsync(TAggregateRoot aggregate, CancellationToken cancellationToken = default);
}