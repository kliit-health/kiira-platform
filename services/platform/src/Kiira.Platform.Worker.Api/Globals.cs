global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.DependencyInjection;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.Threading;
global using System.Threading.Tasks;

namespace Kiira.Platform.Worker.Api;

public static class Globals
{
	public const string JsonContentType = System.Net.Mime.MediaTypeNames.Application.Json;
	public const string HtmlContentType = System.Net.Mime.MediaTypeNames.Text.Html;
	public const string TextContentType = System.Net.Mime.MediaTypeNames.Text.Plain;
}