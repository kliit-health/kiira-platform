namespace Kiira.Data.Firebase;

public class FirestoreServiceException : ApplicationException
{
	public FirestoreServiceException(string message) : base(message)
	{
	}
}