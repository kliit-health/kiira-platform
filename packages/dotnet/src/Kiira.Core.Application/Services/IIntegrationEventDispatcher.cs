using Kiira.Core.Application.Messages;

namespace Kiira.Core.Application.Services;

public interface IIntegrationEventDispatcher
{
	void Raise<TIntegrationEvent>(TIntegrationEvent integrationEvent)
		where TIntegrationEvent : IIntegrationEvent;
		
	void Clear();

	Task PublishAsync(CancellationToken cancellationToken = default);
}