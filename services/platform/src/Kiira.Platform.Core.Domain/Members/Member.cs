using System.Collections.Immutable;
using Kiira.Core.Domain;
using Kiira.Platform.Core.Domain.Identity;

namespace Kiira.Platform.Core.Domain.Members;

public class Member
{
	private readonly IList<MemberBenefit> _benefits
		= new List<MemberBenefit>();

	public IReadOnlyList<MemberBenefit> Benefits
		=> _benefits.ToImmutableList();

	public void AddMemberBenefit(Benefit benefit, DateTimeOffset now, string source, Guid? correlationId = default)
	{
		_benefits.Add(new MemberBenefit(
			benefit.Quantity, benefit.ProductId, benefit.Renews, now, correlationId, benefit.CorrelationFactor, source));
	}

	public void AddMemberBenefits(IEnumerable<Benefit> benefits, DateTimeOffset now, string source, Guid? correlationId = default)
	{
		foreach (var benefit in benefits)
			this.AddMemberBenefit(benefit, now, source, correlationId);
	}
	
	// how many credits does this member have for a particular service/product?
	public int GetMemberBenefitCredits(Guid productId, DateTimeOffset now)
	{
		var productBenefits = _benefits.Where(mb =>
			mb.ProductId == productId && mb.DateExpires >= now);

		return productBenefits.Sum(mb => mb.Quantity);
	}
	
	// use the specified number of credits
	public void UseMemberBenefitCredits(Guid productId, DateTimeOffset now, int quantity = 1)
	{
		var credits = this.GetMemberBenefitCredits(productId, now);
		
		if (credits < quantity)
			throw new ApplicationException($"member does not have enough credits ({credits}) to utilize the {productId} product");
		
		// iterate through the collection of benefits, deducting until we've exhausted the quantity
		var remainingQuantity = quantity;

		// use the credits that are expiring first
		var productBenefits = _benefits.Where(mb =>
			mb.ProductId == productId && mb.DateExpires >= now).OrderBy(mb => mb.DateExpires);
		
		while (remainingQuantity > 0)
		{
			foreach (var productBenefit in productBenefits)
			{
				// determine how many credits to deduct
				var quantityToDeduct = productBenefit.Quantity >= remainingQuantity
					? remainingQuantity : productBenefit.Quantity;

				// decrement quantity from benefit
				productBenefit.DecrementQuantity(quantityToDeduct);
				
				// deduct equivalent quantity from correlated benefits
				var correlatedBenefits = _benefits.Where(mb =>
					mb.CorrelationId == productBenefit.CorrelationId && mb.ProductId != productBenefit.ProductId);

				foreach (var correlatedBenefit in correlatedBenefits)
				{
					// deduct the base quantity times the correlation of the product being used
					correlatedBenefit.DecrementQuantity(quantityToDeduct * productBenefit.CorrelationFactor);
					
					if (correlatedBenefit.Quantity < 0)
						correlatedBenefit.SetQuantity(0);
				}

				remainingQuantity -= quantityToDeduct;
			}
		}
	}
}
//
// public class Member : Entity<UserId>
// {
// 	protected Member()
// 	{
// 	}
//
// 	public string? FirstName { get; private set; }
// 	public string? LastName { get; private set; }
//
// 	public MemberEmail? Email { get; private set; }
// 	public MemberPhone? Phone { get; private set; }
//
// 	#region - memberships
//
// 	#endregion
//
// 	#region - subscriptions
//
// 	#endregion
//
// 	#region - products
//
// 	#endregion
//
// 	public void VerifyEmail()
// 	{
// 		throw new NotImplementedException();
// 	}
//
// 	public void VerifyPhone()
// 	{
// 		throw new NotImplementedException();
// 	}
// }