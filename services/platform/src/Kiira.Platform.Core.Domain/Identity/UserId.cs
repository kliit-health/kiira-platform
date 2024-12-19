namespace Kiira.Platform.Core.Domain.Identity;

/// <summary>
/// Represents a globally unique identifier for all users in the Kiira Health platform.
/// </summary>
/// <param name="_value">The intrinsic UUID value to represent this instance.</param>
public record UserId(Guid _value)
{
	private readonly Guid _value = _value;

	public static readonly UserId Empty
		= new UserId(Guid.Empty);

	public override string ToString()
		=> _value.ToString("N").ToUpper();

	public static implicit operator UserId(Guid value)
		=> new UserId(value);
	
	public static implicit operator Guid(UserId value)
		=> value._value;
}