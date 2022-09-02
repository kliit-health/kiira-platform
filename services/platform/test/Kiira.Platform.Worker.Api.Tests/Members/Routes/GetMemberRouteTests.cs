using Kiira.Platform.Worker.Api.Members.Routes;

namespace Kiira.Platform.Worker.Api.Tests.Members.Routes;

public class GetMemberRouteTests
{
	[Fact]
	public async Task Handle_returns200_whenMemberIsFound()
	{
		// arrange
		var handler = new GetMemberRoute.Handler();
		var request = new GetMemberRoute.Request("M123");
		
		// act
		var response = await handler.Handle(request, CancellationToken.None);
		
		// assert
		Assert.Equal(200, response.Status);
	}

	[Fact]
	public async Task Handle_returns404_whenMemberIsNotFound()
	{
		// arrange
		var handler = new GetMemberRoute.Handler();
		var request = new GetMemberRoute.Request("M000");
		
		// act
		var response = await handler.Handle(request, CancellationToken.None);
		
		// assert
		Assert.Equal(404, response.Status);
	}
}