using Kiira.Core.Services;

namespace Kiira.Core.Entities;

/// <summary>
/// Defines a unit of work context for atomically committing transactions.
/// </summary>
/// <remarks>
/// Implementations of IEntityContext should have the related repositories exposed
/// as properties. This way, the client can clearly understand that all repository
/// changes won't be committed until explicitly called.
/// </remarks>
public interface IEntityContext
{
	/// <summary>
	/// A provider for adding/removing integration events from the current context.
	/// </summary>
	IIntegrationEventProvider IntegrationEvents { get; }
	
	/// <summary>
	/// Commits all pending repository changes.
	/// </summary>
	/// <remarks>
	/// If there are any pending integration events, those will be published after invocation.
	/// </remarks>
	/// <param name="cancellationToken">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
	Task CommitAsync(CancellationToken cancellationToken = default);
}