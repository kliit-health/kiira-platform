namespace Kiira.Platform.Core.Domain.Members;

public interface Organization
{
	string Id { get; }
	
	string DisplayName { get; }		// Kiira Health, Redwoods, UC Berkeley, UC Davis
	string Description { get; }

	void Rename(string displayName);
	void Disable();
	void AddMemberPlan();
	void AddAddOnPackage();
}

public interface MemberPlan
{
	string DisplayName { get; }		// Premium Membership, Kiira Employee Plan, UC Davis Student Plan, UC Davis Employee Plan
	string Description { get; }

	object OrganizationId { get; }	// who owns this package
}

public interface AddOnPackage
{
	string DisplayName { get; }		// Mental Health Monthly Package, Mental Health Annual Package, IV Treatment Package
	string Description { get; }

	object OrganizationId { get; }	// who owns this package
}

public interface AddOnSubscription
{
	object MemberId { get; }
	object AddOnPackageId { get; }
}

// subscription: instance of a member plus a membership plan, or a package bundle
// - subscription 1 = D2C Kiira Membership
// - subscription 2 = Mental Health Package
// - subscription 3 = IV Drip Package

// MembershipPlan
// Package

public class MembershipPackage
{
	private Product[] Products { get; }
}

public class SubscriptionPackage
{
	private Product[] Products { get; }
}

// membership plan
// membership add-on
// membership plan = a set of products and/or product bundles that are included with this membership
// subscription plan = a set of products and/or product bundles that are included with this subscription

// member + plan
public class Membership
{
}

public class 

// member + package
public class Subscription
{
}

public class Package
{
}

public class Product
{
}

public class MemberAggregate : Member
{
}

public class SqlMemberRepository : IMemberRepository
{
	public Task<Member> GetAsync(object id, CancellationToken cancellationToken = default)
	{
		return Task.Run<Member>(() => new MemberAggregate(), cancellationToken);
	}
}