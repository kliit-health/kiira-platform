using Kiira.Core.Messages;

namespace Kiira.Core.Services;

/// <summary>
/// Defines methods for publishing/broadcasting integration events to external services.
/// </summary>
public interface IIntegrationEventPublisher
{
	/// <summary>
	/// Publishes the given integration event to a message broker.
	/// </summary>
	/// <param name="integrationEvent">The integration event to publish.</param>
	/// <param name="cancellationToken">A <see cref="CancellationToken"/> to observe while waiting for the task to complete.</param>
	/// <typeparam name="TIntegrationEvent">The type of integration event.</typeparam>
	Task PublishAsync<TIntegrationEvent>(TIntegrationEvent integrationEvent, CancellationToken cancellationToken = default)
		where TIntegrationEvent : IIntegrationEvent;
}