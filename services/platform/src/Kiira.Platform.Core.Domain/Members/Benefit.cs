using Kiira.Core.Domain;

namespace Kiira.Platform.Core.Domain.Members;

public class Benefit
{
	public Benefit(int quantity, Guid productId, Recurrence renews, Guid? correlationId, int correlationFactor)
	{
		this.Quantity = quantity;
		this.ProductId = productId;
		this.Renews = renews;
		this.CorrelationId = correlationId;
		this.CorrelationFactor = correlationFactor;
	}

	public int Quantity { get; private set; }
	public Guid ProductId { get; private set; }

	public Recurrence Renews { get; private set; }

	public Guid? CorrelationId { get; private set; }
	public int CorrelationFactor { get; private set; }
}