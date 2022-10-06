using Google.Cloud.Firestore;

namespace Kiira.Data.Firestore;

public class FirestoreService : IFirestoreService
{
	private readonly FirestoreDb _db;
	private readonly WriteBatch _batch;

	public FirestoreService(FirestoreDb? db, FirestoreServiceConfig config)
	{
		_db = db ?? FirestoreDb.Create(config.ProjectId);
		_batch = _db.StartBatch();
	}

	public async Task<T> GetDocumentAsync<T>(string path, CancellationToken cancellationToken = default)
	{
		var documentReference = _db.Document(path);
		var documentSnapshot = await documentReference.GetSnapshotAsync(cancellationToken);

		if (!documentSnapshot.Exists)
			throw new FirestoreServiceException($"could not retrieve document at path: '{path}'");
		
		return documentSnapshot.ConvertTo<T>();	
	}

	public void CreateDocument<T>(string path, T document)
	{
		var documentReference = _db.Document(path);
		_batch.Create(documentReference, document);
	}

	public void DeleteDocument(string path)
	{
		var documentReference = _db.Document(path);
		_batch.Delete(documentReference, Precondition.None);
	}

	public void UpdateDocument<T>(string path, T document)
	{
		var documentReference = _db.Document(path);
		_batch.Set(documentReference, document, SetOptions.MergeAll);
	}

	public async Task CommitAsync(CancellationToken cancellationToken = default)
	{
		await _batch.CommitAsync(cancellationToken);
	}
}