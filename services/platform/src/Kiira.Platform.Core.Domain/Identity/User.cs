using Kiira.Core.Domain;

namespace Kiira.Platform.Core.Domain.Identity;

/// <summary>
/// Represents a user profile within the Kiira Health platform.
/// </summary>
/// <remarks>
/// Can represent Kiira members, patients, doctors, staff, etc...
/// </remarks>
public class User : Entity<UserId>
{
	protected User()
	{
		this.Id = UserId.Empty;
	}
	
	/// <summary>
	/// The user's given name.
	/// </summary>
	public string FirstName { get; private set; }
		= string.Empty;

	/// <summary>
	/// The user's family name.
	/// </summary>
	public string LastName { get; private set; }
		= string.Empty;

	/// <summary>
	/// The user's date of birth.
	/// </summary>
	public DateTime? Birthdate { get; private set; }

	/// <summary>
	/// The user's email address.
	/// </summary>
	public UserEmail? Email { get; private set; }

	/// <summary>
	/// The user's phone number.
	/// </summary>
	public UserPhone? Phone { get; private set; }
	
	/// <summary>
	/// The authentication provider information.
	/// </summary>
	public AuthenticationProvider? AuthProvider { get; private set; }
}

public record NewUserAdded(UserId UserId, string FirstName, string LastName, DateTimeOffset EventDate) : IDomainEvent
{
	public DateTime? Birthdate { get; set; }
	public UserEmail? Email { get; set; }
	public UserPhone? Phone { get; set; }
}