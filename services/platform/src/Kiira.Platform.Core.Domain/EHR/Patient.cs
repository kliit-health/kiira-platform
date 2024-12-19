using Kiira.Core.Domain;
using Kiira.Platform.Core.Domain.Identity;

namespace Kiira.Platform.Core.Domain.EHR;

public class Appointment : Entity<Guid>
{
	public UserId PatientId { get; private set; }
	public string PatientMrn { get; private set; }
	public UserId ProviderId { get; private set; }

	public DateTimeOffset Date { get; private set; }
	public object Status { get; private set; }
	public object Location { get; private set; }
	public object Duration { get; private set; }
	public object CreatedAt { get; private set; }
	public object CreatedBy { get; private set; }

	public Guid AppointmentTypeId { get; private set; }

	// a single appointment can cover multiple billable services
	public IReadOnlyList<Guid> Services { get; private set; }
}

public class AppointmentType
{
}

// not for granular visit status, but for scheduling
public enum AppointmentStatus
{
	Created = 0,
	Pending = 1,
	Reserving = 1,
	Scheduled = 2,
	Confirmed = 3,
	Cancelled = 4,
	// scheduled, not-seen, confirmed, checked-in, visiting, checked-out, in-room, with-provider, 
}

/// <summary>
/// Represents a patient in the Kiira Health network of services.
/// </summary>
public class Patient : Entity<UserId>
{
	protected Patient()
	{
		this.Id = UserId.Empty;
	}
	
	/// <summary>
	/// The Kiira Health Medical Record Number for this patient.
	/// </summary>
	public string MRN { get; }

	/// <summary>
	/// The patient's first name.
	/// </summary>
	public string FirstName { get; }
	
	/// <summary>
	/// The patient's middle name.
	/// </summary>
	public string MiddleName { get; }
	
	/// <summary>
	/// The patient's last name.
	/// </summary>
	public string LastName { get; }

	/// <summary>
	/// The patient's date of birth.
	/// </summary>
	public DateTime Birthdate { get; }
}

public static class X
{
	// the characters 'I', 'O', and 'Q' are omitted so as not to have
	// any confusion with the numbers 1 and 0
	private static char[] chars
		= "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();

	public static string ConvertToAnyBase(long value, int radix)
	{
		var result = string.Empty;

		if (radix > chars.Length)
			throw new ArgumentOutOfRangeException(nameof(radix), radix,
				$"Cannot convert to a base greater than {chars.Length}.");

		if (value < radix)
			return chars[value].ToString();

		while (value != 0)
		{
			var index = value % radix;
			value = value / radix;
			//value = Convert.ToInt64(Math.Floor(quotient));
			//result += chars[index].ToString();
			result = string.Concat(chars[index].ToString(), result);
		}

		return result;
	}
}

