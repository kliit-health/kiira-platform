namespace Kiira.Platform.Core.Domain.Identity;

/// <summary>
/// Represents the user's phone number.
/// </summary>
/// <param name="Value">The phone number.</param>
/// <param name="IsVerified">Indicates whether or not the user has verified ownership of the phone number.</param>
public record UserPhone(string Value, bool IsVerified = false)
{
	public override string ToString()
		=> this.Value;
}