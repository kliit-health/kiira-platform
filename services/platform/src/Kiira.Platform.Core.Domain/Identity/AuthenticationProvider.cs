namespace Kiira.Platform.Core.Domain.Identity;

/// <summary>
/// Represents the external authentication provider (identity service) used for Kiira application and user credentials.
/// </summary>
public class AuthenticationProvider
{
	public AuthenticationProvider(string providerName, string providerId, string providerType)
	{
		this.Id = providerId;
		this.Name = providerName;
		this.Type = providerType;
	}
	
	/// <summary>
	/// The name of the authentication provider.
	/// </summary>
	/// <example>
	/// Firebase Authentication, Auth0, Okta
	/// </example>
	public string Name { get; private set; }

	/// <summary>
	/// The unique identifier of the auth account withing this provider's system.
	/// </summary>
	public string Id { get; private set; }

	/// <summary>
	/// The manner in which authentication is integrated with Kiira Health.
	/// </summary>
	/// <example>
	/// username/password; social login, sso
	/// </example>
	public string Type { get; private set; }
}