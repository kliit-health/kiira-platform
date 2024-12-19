using MediatR;

namespace Kiira.Core.Application.Features;

public abstract class FeatureRequestHandler<TReq, TRes> : IRequestHandler<TReq, TRes>
	where TReq : IFeatureRequest<TRes>
	where TRes : IFeatureResponse
{
	protected abstract Task<TRes> HandleRequest(TReq request, CancellationToken cancellationToken);
		
	async Task<TRes> IRequestHandler<TReq, TRes>.Handle(TReq request, CancellationToken cancellationToken)
	{
		return await this.HandleRequest(request, cancellationToken);
	}
}