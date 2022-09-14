namespace Kiira.Platform.Core.Domain.Members;

public interface Member
{
	// 968d73e0-9b8a-4bce-b55b-da7e00ca374f
	// 5462474417580635104
	
	// member.Id
	// member.Number
	// member.Identifier
	// member.KhId
	// daff286a-aff2-46e4-9218-7d90696cab0c
	// daff286aaff246e492187d90696cab0c
	// KH-20220914091535
	// KH123456789
	// KSH
}

public interface MemberBuilder
{
	Member Build();
}

public interface MemberBuilderFactory
{
	MemberBuilder Create(object id);
}

public interface MemberRepository
{
	Task<Member> GetAsync(object id, CancellationToken cancellationToken = default);
}