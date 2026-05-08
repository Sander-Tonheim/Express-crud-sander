async function getUserData(connection, email) {
	const [results] = await connection.query(
		`SELECT * FROM user WHERE email = "${email}"`
	);
	return results;
}

async function insertIntoUserDatabase(connection, email, password) {
	const query = "INSERT INTO user (email, password) VALUES (?, ?)";
	return await connection.execute(query, [email, password]);
}

async function insertIntoBistandDatabase(connection, text, email) {
	const query = "INSERT INTO question (question, email) VALUES (?, ?)";
	return await connection.execute(query, [text, email]);
}

async function getUserText(connection, email) {
	const [results] = await connection.query(
		`SELECT * FROM question WHERE email = "${email}"`
	);
	return results;
}

async function deleteUser(email) {
	const deleteUserQuery = "DELETE FROM user WHERE email = ?";
	connection.execute(deleteUserQuery, [email]);

	connection.end();
}
module.exports = {
	getUserData,
	insertIntoUserDatabase,
	insertIntoBistandDatabase,
	getUserText,
};
