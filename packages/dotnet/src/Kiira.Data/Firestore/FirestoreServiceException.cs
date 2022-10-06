namespace Kiira.Data.Firestore;

public class FirestoreServiceException : ApplicationException
{
	public FirestoreServiceException(string message) : base(message)
	{
	}
}