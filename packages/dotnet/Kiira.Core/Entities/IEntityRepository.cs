namespace Kiira.Core.Entities;

/// <summary>
/// Defines a repository containing methods to implement CRUD functionality for entities.
/// </summary>
/// <typeparam name="TEntity"></typeparam>
/// <typeparam name="TEntityId"></typeparam>
public interface IEntityRepository<TEntity, in TEntityId>
	where TEntity : IEntity<TEntityId>
{
	/// <summary>
	/// Retrieves an entity with the given identifier.
	/// </summary>
	/// <param name="id">The unique identifier of the entity.</param>
	/// <param name="cancellationToken">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
	/// <returns>An entity, identified by the given id.</returns>
	Task<TEntity> GetAsync(TEntityId id, CancellationToken cancellationToken = default);
	
	/// <summary>
	/// Appends the given entity to the repository.
	/// </summary>
	/// <param name="entity">The entity to add.</param>
	void Append(TEntity entity);
	
	/// <summary>
	/// Deletes an entity from the repository with the given identifier.
	/// </summary>
	/// <param name="id">The unique identifier of the entity to delete.</param>
	void Delete(TEntityId id);
	
	/// <summary>
	/// Updates the given entity in the repository.
	/// </summary>
	/// <param name="entity">The entity to update.</param>
	void Update(TEntity entity);
}