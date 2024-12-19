using Kiira.Core.Messages;

namespace Kiira.Core.Services;

/// <summary>
/// Defines methods for raising and removing integration events from the current context.
/// </summary>
public interface IIntegrationEventProvider
{
	/// <summary>
	/// Appends a new integration event to the current context.
	/// </summary>
	/// <param name="integrationEvent">The integration event to add.</param>
	/// <typeparam name="TIntegrationEvent">The type of integration event.</typeparam>
	void Raise<TIntegrationEvent>(TIntegrationEvent integrationEvent)
		where TIntegrationEvent : IIntegrationEvent;

	/// <summary>
	/// Removes all pending integration events from the current context.
	/// </summary>
	void Clear();
}