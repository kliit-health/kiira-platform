module.exports = (collectionName:any, conditions = [], limit = 20000) =>
	new Promise((resolve, reject) =>
		(async function () {
			const database = admin.firestore()
			try {
				let query = database.collection(collectionName)
				for (let condition of conditions) {
					const { key, operator, value } = condition
					query = query.where(key, operator, value)
				}
				const response = await query.limit(limit).get()
				const data = response.docs.map((item:any) => ({
					...item.data(),
					id: item.id
				}))
				resolve(data)
			} catch (error) {
				reject(error)
			}
		})()
	)
