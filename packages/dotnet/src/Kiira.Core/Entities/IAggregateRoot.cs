namespace Kiira.Core.Entities;

/// <summary>
/// Defines an aggregate root with a single unique identifier.
/// </summary>
/// <typeparam name="TAggregateRootId">The type of identifier of the aggregate.</typeparam>
public interface IAggregateRoot<out TAggregateRootId> : IEntity<TAggregateRootId>
{
	/// <summary>
	/// Returns a collection of pending domain events.
	/// </summary>
	/// <returns>A read-only collection of pending domain events.</returns>
	IReadOnlyList<IDomainEvent> GetEvents();

	/// <summary>
	/// Removes all pending domain events from the aggregate.
	/// </summary>
	void ClearEvents();
}