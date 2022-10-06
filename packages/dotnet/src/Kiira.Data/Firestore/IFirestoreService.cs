namespace Kiira.Data.Firestore;

public interface IFirestoreService
{
	Task<T> GetDocumentAsync<T>(string path, CancellationToken cancellationToken = default);
	
	void CreateDocument<T>(string path, T document);
	void DeleteDocument(string path);
	void UpdateDocument<T>(string path, T document);

	Task CommitAsync(CancellationToken cancellationToken = default);
}