namespace Kiira.Platform.Core.Domain.Members;

public class MembershipOwner
{
	public MembershipOwner(string id, string name, string type)
	{
		this.Id = id;
		this.Name = name;
		this.Type = type;
	}

	public string Id { get; private set; }
	public string Name { get; private set; }
	public string Type { get; private set; }
}