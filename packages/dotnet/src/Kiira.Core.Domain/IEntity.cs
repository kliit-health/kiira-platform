namespace Kiira.Core.Domain;

public interface IEntity<out TEntityId>
{
	TEntityId Id { get; }
}