namespace Kiira.Platform.Core.Domain.Identity;

/// <summary>
/// Represents the user's email address.
/// </summary>
/// <param name="Value">The email address.</param>
/// <param name="IsVerified">Indicates whether or not the user has verified ownership of the email address.</param>
public record UserEmail(string Value, bool IsVerified = false)
{
	public override string ToString()
		=> this.Value;
}