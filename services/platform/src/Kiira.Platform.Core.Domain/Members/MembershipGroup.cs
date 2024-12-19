using Kiira.Core.Domain;

namespace Kiira.Platform.Core.Domain.Members;

public class MembershipGroup : Entity<Guid>
{
	public string DisplayName { get; private set; }
	public string Description { get; private set; }

	public decimal Price { get; private set; }

	public Recurrence RenewalPeriod { get; }
		= Recurrence.EveryYear;

	public Guid OrganizationId { get; private set; }
}