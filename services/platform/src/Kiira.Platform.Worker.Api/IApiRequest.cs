namespace Kiira.Platform.Worker.Api;

public interface IApiRequest<out T> : MediatR.IRequest<T>
	where T : IApiResponse
{
}