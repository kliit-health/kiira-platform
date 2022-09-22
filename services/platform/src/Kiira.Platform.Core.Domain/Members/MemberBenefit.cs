using Kiira.Core.Domain;

namespace Kiira.Platform.Core.Domain.Members;

public class MemberBenefit
{
	public MemberBenefit(int quantity, Guid productId, Recurrence renews, DateTimeOffset now, Guid? correlationId, int correlationFactor, string source)
	{
		this.Quantity = quantity;
		this.ProductId = productId;
		this.Renews = renews;
		this.DateAdded = now;
		this.DateExpires = this.GetNextDate(now, renews);
		this.CorrelationId = correlationId;
		this.CorrelationFactor = correlationFactor;
		this.Source = source;
	}

	// benefit + added date, expiration, source
	public int Quantity { get; private set; }
		= 0;

	public Guid ProductId { get; private set; }
		= Guid.Empty;

	public Recurrence Renews { get; private set; }
		= Recurrence.Never;

	public DateTimeOffset? DateAdded { get; private set; }
	public DateTimeOffset? DateExpires { get; private set; }

	public Guid? CorrelationId { get; }
	public int CorrelationFactor { get; }

	public string Source { get; }

	public void SetQuantity(int amount)
	{
		this.Quantity = amount;
	}
	
	public void IncrementQuantity(int amount)
	{
		this.Quantity += amount;
	}

	public void DecrementQuantity(int amount)
	{
		this.Quantity -= amount;
	}

	private DateTimeOffset? GetNextDate(DateTimeOffset now, Recurrence recurrence)
	{
		return recurrence.Type switch
		{
			RecurrenceType.None => now,
			RecurrenceType.Monthly => now.AddMonths(recurrence.Interval),
			RecurrenceType.Yearly => now.AddYears(recurrence.Interval),
			_ => null
		};
	}
}