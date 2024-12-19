namespace Kiira.Platform.Core.Application.Identity.Features;

public static class SignUp
{
	// orchestrated saga to handle the become-a-member workflow
	// required fields: first+last names, email, phone, date-of-birth, location (state), agree to t&c
	
	// 1. send AddNewUser message to Identity Service
	// 2. Identity Service publishes NewUserAdded message
	// 3. send AddNewMember message to Members Service
	// 4. Members Service publishes NewMemberAdded message (or FailedToAddNewMember)
	// 5. send AddMembership message to Members Service
	// 6. Members Service publishes MembershipAdded message (or FailedToAddMembership)
	// 7. send AddSubscription message to Members Service
	
	// 1. AddNewUser
	// 2. AddNewMember
	// 3. AddNewPatient
	
	// 1. submit request to become a member
	// 2. confirm payment information is correct and charged correctly
	// 3. submit command to create new account
	// 4. submit command to create new member, with specified membership and optional package add-ons
	
	// choreography (event-based)
	// 1. send BecomeMember command to Members Service via API
	// 2. publish BecomeMemberRequested event
	// 3. handle BecomeMemberRequested event in Payment Service
	// 4. publish MembershipPaid event (MembershipRenewed)
	// 5. (optional) publish SubscriptionPaid event (SubscriptionRenewed)
	// 6. handle MembershipPaid event in Members Service (create new member, add membership)
	// 7. handle SubscriptionPaid event in Members Service (add subscription)
}

public static class BookAnAppointment
{
}

public static class CancelAppointment
{
}

public static class UpdateAppointment
{
}

// register-only flow
// - create new account
// - create new member (on AccountCreated domain event)
// - add membership subscription
// - add add-on package subscription(s), if purchased

// add membership to existing account
// renew membership
// cancel membership

// add subscription to existing member
// cancel subscription

// book an appointment flow (non-existing member)
// book an appointment flow (existing member)