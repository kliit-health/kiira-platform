namespace Kiira.Core.Entities;

/// <inheritdoc/>
public abstract class Entity<TEntityId> : IEntity<TEntityId>
{
	public TEntityId Id { get; protected set; }
}