using System;
using Kiira.Core.Domain;
using Kiira.Platform.Core.Domain.Members;
using Xunit;

namespace Kiira.Platform.Core.Domain.Tests.Members;

public class MemberTests
{
	[Fact]
	public void GetMemberBenefitCredits_returnsZero_whenCreditsAreExpired()
	{
		// arrange
		var haProdId = Guid.NewGuid();
		var vvProdId = Guid.NewGuid();
		var mhProdId = Guid.NewGuid();
		var corrId = Guid.NewGuid();
		
		var benefit1 = new Benefit(1, haProdId, Recurrence.Never, null, 1);
		var benefit2 = new Benefit(2, vvProdId, Recurrence.EveryYear, corrId, 1);
		var benefit3 = new Benefit(1, mhProdId, Recurrence.EveryYear, corrId, 2);
		
		var member = new Member();
		member.AddMemberBenefit(benefit1, DateTimeOffset.Now.AddYears(-2), "unit-test");
		member.AddMemberBenefits(new [] { benefit2, benefit3 }, DateTimeOffset.Now.AddYears(-2), "unit-test", corrId);
		
		// act
		var credits = member.GetMemberBenefitCredits(vvProdId, DateTimeOffset.Now);
		
		// assert
		Assert.Equal(0, credits);
	}

	[Fact]
	public void GetMemberBenefitCredits_returnsCorrectCredits()
	{
		// arrange
		var vvProdId = Guid.NewGuid();
		var corrId = Guid.NewGuid();
		
		var benefit = new Benefit(3, vvProdId, Recurrence.EveryYear, corrId, 2);

		
		var member = new Member();
		member.AddMemberBenefit(benefit, DateTimeOffset.Now, "unit-test");
		
		// act
		var credits = member.GetMemberBenefitCredits(vvProdId, DateTimeOffset.Now);
		
		// assert
		Assert.Equal(3, credits);
	}

	[Fact]
	public void UseMemberBenefitCredits_deductsCredits_whenBenefitsAreCorrelated()
	{
		// arrange
		var vvProdId = Guid.NewGuid();
		var mhProdId = Guid.NewGuid();
		var ivProdId = Guid.NewGuid();
		var benefitCorrelationId = Guid.NewGuid();
		var memberBenefitCorrelationId = Guid.NewGuid();
		
		// 4 virtual visits OR 2 mental health visits OR 1 IV treatment
		var vvBenefit = new Benefit(4, vvProdId, Recurrence.EveryYear, benefitCorrelationId, 1);
		var mhBenefit = new Benefit(2, mhProdId, Recurrence.EveryYear, benefitCorrelationId, 2);
		var ivBenefit = new Benefit(1, ivProdId, Recurrence.EveryYear, benefitCorrelationId, 4);
		
		var member = new Member();
		member.AddMemberBenefits(new [] { vvBenefit, mhBenefit, ivBenefit }, DateTimeOffset.Now, "unit-test", memberBenefitCorrelationId);
		
		// act
		member.UseMemberBenefitCredits(vvProdId, DateTimeOffset.Now, 1);
		
		// assert
		var vvCredits = member.GetMemberBenefitCredits(vvProdId, DateTimeOffset.Now);
		var mhCredits = member.GetMemberBenefitCredits(mhProdId, DateTimeOffset.Now);
		var ivCredits = member.GetMemberBenefitCredits(ivProdId, DateTimeOffset.Now);

		Assert.Equal(3, vvCredits);
		Assert.Equal(1, mhCredits);
		Assert.Equal(0, ivCredits);
	}
}