namespace Kiira.Core.Entities;

/// <summary>
/// Defines an aggregate that uses the specified domain event type to update its own state.
/// </summary>
/// <typeparam name="TDomainEvent">The type of domain event.</typeparam>
public interface IDomainEventAggregate<in TDomainEvent>
	where TDomainEvent : IDomainEvent
{
	/// <summary>
	/// Updates the state of the aggregate using the given domain event.
	/// </summary>
	/// <param name="domainEvent">The domain event to consume.</param>
	void Apply(TDomainEvent domainEvent);
}