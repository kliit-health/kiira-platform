using System.Collections.Immutable;

namespace Kiira.Core.Domain;

public abstract class Entity<TEntityId> : IEntity<TEntityId>
{
	public TEntityId Id { get; protected set; }
}

public interface IAggregateRoot<out TAggregateRootId> : IEntity<TAggregateRootId>
{
	IReadOnlyList<IDomainEvent> GetDomainEvents();
	void ClearDomainEvents();
}

public interface IEntityRepository<TEntity, in TEntityId>
{
	Task<TEntity?> GetAsync(TEntityId id, CancellationToken cancellationToken = default);

	void Append(TEntity entity);
	void Update(TEntity entity);
	void Remove(TEntityId id);

	Task CommitAsync(CancellationToken cancellationToken = default);
}

public interface IAggregateRootRepository<TAggregateRoot, in TAggregateRootId>
{
	Task<TAggregateRoot?> GetAsync(TAggregateRootId id, CancellationToken cancellationToken = default);
	Task SaveAsync(TAggregateRoot aggregate, CancellationToken cancellationToken = default);
}

public abstract class AggregateRoot<TAggregateRootId> : Entity<TAggregateRootId>, IAggregateRoot<TAggregateRootId>
{
	private IList<IDomainEvent> _events
		= new List<IDomainEvent>();

	public IReadOnlyList<IDomainEvent> GetDomainEvents()
		=> _events.ToImmutableList();

	public void ClearDomainEvents()
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

public interface IDomainEvent : MediatR.INotification
{
}

public interface IDomainEventAggregate<in TDomainEvent>
	where TDomainEvent : IDomainEvent
{
	void Apply(TDomainEvent domainEvent);
}

public record Recurrence(int Interval, RecurrenceType Type)
{
	public static readonly Recurrence Never = new Recurrence(0, RecurrenceType.None);
	public static readonly Recurrence EveryMonth = new Recurrence(1, RecurrenceType.Monthly);
	public static readonly Recurrence EveryYear = new Recurrence(1, RecurrenceType.Yearly);
}

public enum RecurrenceType
{
	None = 0,
	Monthly = 1,
	Yearly = 2
}

public interface IDateProvider
{
	DateTimeOffset Now();
}

public interface IGuidProvider
{
	Guid New();
}