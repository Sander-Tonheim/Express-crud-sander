async function getUserData(connection, email) {
	const [results] = await connection.query(
		`SELECT * FROM user WHERE email = "${email}"`,
	);
	return results;
}

async function insertIntoUserDatabase(connection, email, password) {
	const query = "INSERT INTO user (email, password) VALUES (?, ?)";
	return await connection.execute(query, [email, password]);
}

async function insertIntoBistandDatabase(connection, text, email) {
	const query = "INSERT INTO bistand (userName, text) VALUES (?, ?)";
	return await connection.execute(query, [email, text]);
}

async function getUserText(connection, email) {
	const [results] = await connection.query(
		`SELECT * FROM bistand WHERE email = "${email}"`,
	);
	return results;
}
module.exports = {
	getUserData,
	insertIntoUserDatabase,
	insertIntoBistandDatabase,
	getUserText,
};
