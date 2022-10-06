namespace Kiira.Core.Entities;

/// <summary>
/// Defines an entity containing a single unique identifier.
/// </summary>
/// <typeparam name="TEntityId">The type of identifier of the entity.</typeparam>
public interface IEntity<out TEntityId>
{
	/// <summary>
	/// The entity's unique identifier.
	/// </summary>
	TEntityId Id { get; }
}