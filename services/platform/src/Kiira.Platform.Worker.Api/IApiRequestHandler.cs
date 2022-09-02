namespace Kiira.Platform.Worker.Api;

public interface IApiRequestHandler<in T, U> : MediatR.IRequestHandler<T, U>
	where T : IApiRequest<U>
	where U : IApiResponse
{
}