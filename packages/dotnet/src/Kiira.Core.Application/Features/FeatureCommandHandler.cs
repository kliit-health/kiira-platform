using MediatR;

namespace Kiira.Core.Application.Features;

public abstract class FeatureCommandHandler<TCmd> : IRequestHandler<TCmd>
	where TCmd : IFeatureCommand
{
	protected abstract Task HandleCommand(TCmd command, CancellationToken cancellationToken);
		
	async Task<Unit> IRequestHandler<TCmd, Unit>.Handle(TCmd request, CancellationToken cancellationToken)
	{
		await this.HandleCommand(request, cancellationToken);
		return Unit.Value;
	}
}