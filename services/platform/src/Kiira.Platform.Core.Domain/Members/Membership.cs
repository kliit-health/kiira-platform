using Kiira.Core.Domain;

namespace Kiira.Platform.Core.Domain.Members;

public class Membership
{
	public Membership(Guid membershipGroupId, DateTimeOffset enrollmentDate, decimal enrollmentPrice, DateTimeOffset nextRenewalDate, MembershipOwner owner)
	{
		this.MembershipGroupId = membershipGroupId;

		this.EnrollmentDate = enrollmentDate;
		this.EnrollmentPrice = enrollmentPrice;

		// at time of enrollment, we know the next renewal date, but we don't know the price yet
		this.NextRenewalDate = nextRenewalDate;
		
		// when the user renews the membership, at that time we will now the date and price
		// and will set the LastRenewalDate and LastRenewalPrice properties accordingly

		this.Status = MembershipStatus.Active;
		this.StatusReason = string.Empty;

		this.Owner = owner;
	}

	public Guid MembershipGroupId { get; }

	public DateTimeOffset EnrollmentDate { get; private set; }
	public decimal EnrollmentPrice { get; private set; }

	public DateTimeOffset? LastRenewalDate { get; private set; }
	public decimal? LastRenewalPrice { get; private set; }

	public DateTimeOffset? NextRenewalDate { get; private set; }
	
	public MembershipOwner? Owner { get; }

	public MembershipStatus Status { get; }
	public string? StatusReason { get; }
}