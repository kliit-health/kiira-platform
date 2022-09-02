# Members Microservice Canvas

### Name:
Members Service

### Description:
Provides functionality and an API for managing members and their memberships.

#

### Capabilities:

* add/edit members
* add/edit/cancel memberships
* add/edit/disable membership plans
* add/edit/disable services
* increment/decrement service credits
* add/edit/disable service bundles

#

### Interface:

| Queries | Commands | Events Published |
| :------ | :------- | :--------------- |
| <ul><li>GetMember()</li><li>GetMemberPlans()</li><li>GetExpiredMemberships()</li><li>GetServices()</li><li>GetServiceBundles()</li></ul> | <ul><li>AddNewMembership()</li><li>UpdateMembership()</li><li>CancelMembership()</li><li>AddNewMemberPlan()</li><li>UpdateMemberPlan()</li><li>DisableMemberPlan()</li><li>AddNewService()</li><li>CreateServiceBundle()</li></ul> | <ul><li>MembershipAdded()</li><li>MembershipUpdated()</li><li>MembershipCancelled()</li><li>MemberPlanAdded()</li><li>MemberPlanUpdated()</li><li>MemberPlanDisabled()</li><li>ServiceAdded()</li><li>ServiceBundleAdded()</li></ul> |

#

## Dependencies:

| Services | Event Subscriptions |
| :------- | :------------------ |
| <ul><li>profile service</li><li>payment service</li><li>ehr service</li></ul> | <ul><li>profile updated</li><li>payment charged</li><li>payment failed</li><li>appointment scheduled</li><li>appointment cancelled</li></ul> |

#

## Implementation

| Qualities | Logic | Data |
| :-------- | :---- | :--- |
| <ul><li>token-based authentication</li></ul> | <ul><li>sync/async commands</li></ul> | <ul><li>member profile data (*not patient data*)</li><li>membershp status</li><li>membershp renewal schedule</li><li>service bundles</li></ul> |