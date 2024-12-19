namespace Kiira.Core.Application.Features;

public interface IFeatureRequest<TRes> : MediatR.IRequest<TRes>
	where TRes : IFeatureResponse
{
}