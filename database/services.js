const nodemailer = require("nodemailer");
async function getUserData(connection, email) {
	const [results] = await connection.query(
		"SELECT * FROM user WHERE email = ?",
		[email]
	);
	return results;
}

async function checkForExistingUser(connection, email) {
	const [results] = await connection.query(
		"SELECT * FROM user WHERE email = ?",
		[email]
	);
	return results[0];
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
		"SELECT * FROM question WHERE email = ?",
		[email]
	);

	return results;
}

async function updateQuestion(connection, email, questionId, updatedQuestion) {
	const query = "UPDATE question SET question = ? WHERE id = ? ";
	return await connection.execute(query, [updatedQuestion, questionId]);
}
async function deleteQuestion(connection, questionId) {
	console.log(questionId);

	const deletePost = "DELETE FROM question WHERE id = ?";
	connection.execute(deletePost, [questionId]);

	connection.end();
	return;
}

async function deleteUser(connection, email) {
	const deleteUserQuery = "DELETE FROM user WHERE email = ?";
	connection.execute(deleteUserQuery, [email]);

	connection.end();
}

async function sendMail(reciverEmail, subject, text) {
	// konfigurasjon for smtp server
	const transporter = nodemailer.createTransport({
		host: "localhost",
		port: 1025,
		secure: false,
	});
	await transporter.sendMail({
		from: "bjotolf@example.com",
		to: reciverEmail,
		subject: subject,
		text: text,
	});
}
module.exports = {
	sendMail,
	getUserData,
	insertIntoUserDatabase,
	insertIntoBistandDatabase,
	getUserText,
	deleteUser,
	checkForExistingUser,
	updateQuestion,
	deleteQuestion,
};
