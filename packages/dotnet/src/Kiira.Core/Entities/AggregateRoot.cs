namespace Kiira.Core.Entities;

/// <inheritdoc cref="IAggregateRoot{TAggregateRootId}" />
public abstract class AggregateRoot<TAggregateRootId> : Entity<TAggregateRootId>, IAggregateRoot<TAggregateRootId>
{
	private readonly List<IDomainEvent> _events
		= new List<IDomainEvent>();

	/// <inheritdoc/>
	public IReadOnlyList<IDomainEvent> GetEvents()
		=> _events.AsReadOnly();

	/// <inheritdoc/>
	public void ClearEvents()
		=> _events.Clear();
	
	protected virtual void RaiseEvent<TDomainEvent>(TDomainEvent domainEvent)
		where TDomainEvent : IDomainEvent
	{
		this.StashEvent(domainEvent);
		this.ApplyEvent(domainEvent);
	}

	protected virtual void StashEvent<TDomainEvent>(TDomainEvent domainEvent)
		where TDomainEvent : IDomainEvent
	{
		_events.Add(domainEvent);
	}

	protected virtual void ApplyEvent<TDomainEvent>(TDomainEvent domainEvent)
		where TDomainEvent : IDomainEvent
	{
		if (this is IDomainEventAggregate<TDomainEvent> aggregate)
			aggregate.Apply(domainEvent);
	}
}