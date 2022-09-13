using Kiira.Platform.Worker.Api.Members.Models;
using Kiira.Platform.Worker.Api.Members.Routes;

namespace Kiira.Platform.Worker.Api.Members;

[Route(BasePathTemplate)]
public class MembersController : ControllerBase
{
	private const string BasePathTemplate = "members";

	private readonly MediatR.IMediator _mediator;

	public MembersController(MediatR.IMediator mediator)
	{
		_mediator = mediator;
	}

	/// <summary>
	/// Retrieves a Kiira member by their identifier.
	/// </summary>
	/// <remarks>GET: /members/:memberId</remarks>
	[HttpGet(GetMemberRoute.PathTemplate)]
	[Produces(Globals.JsonContentType)]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GetMemberRoute.Response))]
	[ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(GetMemberRoute.Response))]
	public async Task<ActionResult<GetMemberRoute.Response>> GetMemberAsync(GetMemberRoute.Request request, CancellationToken cancellationToken)
	{
		// execute business logic via mediator pattern
		var response = await _mediator.Send(request, cancellationToken);
		
		// all route responses should have the status code as a property
		// so that the controller does not have to perform any additional logic
		return this.StatusCode(response.Status, response);
	}
}