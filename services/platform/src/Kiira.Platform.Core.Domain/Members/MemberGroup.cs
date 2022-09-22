using System.Collections.Immutable;

namespace Kiira.Platform.Core.Domain.Members;

/// <summary>
/// Represents a collection of Kiira members, related by the organization they belong to and the benefits they receive.
/// </summary>
public class MemberGroup
{
	private readonly IList<Benefit> _benefits
		= new List<Benefit>();

	public string DisplayName { get; set; }
	public string Description { get; set; }

	// benefits, a collection of products and services offered to members
	public IReadOnlyList<Benefit> GetBenefits()
		=> _benefits.ToImmutableList();

	public void AddBenefits(IEnumerable<Benefit> benefits)
	{
		foreach (var benefit in benefits)
			_benefits.Add(benefit);
	}
}