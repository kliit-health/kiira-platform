using Kiira.Platform.Worker.Api.Members.Models;

namespace Kiira.Platform.Worker.Api.Members.Routes;

public static class GetMemberRoute
{
	public const string PathTemplate = "{memberId}";

	public record Request(
		[property: FromRoute(Name = "memberId")] string MemberId) : IApiRequest<Response>
	{
		[FromQuery(Name = "memberships")]
		public bool IncludeMemberships { get; set; }

		[FromQuery(Name = "subscriptions")]
		public bool IncludeSubscriptions { get; set; }
	}

	public record Response(int Status) : IApiResponse
	{
		[JsonPropertyName("member")]
		public MemberModel? Member { get; set; }
	}

	public class Handler : IApiRequestHandler<Request, Response>
	{
		public Task<Response> Handle(Request request, CancellationToken cancellationToken)
		{
			var member = request.MemberId.Equals("M123") ? new MemberModel {Id = request.MemberId} : null;
			var status = member != null ? 200 : 404;

			return Task.Run(() => new Response(status)
			{
				Member = member
			}, cancellationToken);
		}
	}
}