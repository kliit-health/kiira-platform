using Kiira.Core.Domain;

namespace Kiira.Platform.Core.Domain.Members;

public class Organization : Entity<Guid>
{
	public string DisplayName { get; private set; }
	public string Description { get; private set; }
	
	public Guid ParentOrgId { get; private set; }
}