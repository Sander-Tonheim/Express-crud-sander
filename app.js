// importerer pakker.

const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// Definerer hvilken port som skal være åpen for å motta forespørsler (req) fra klient.
const port = 3000;
// importerer funkjson som lager kobling til databasen.
const { createConnection } = require("./database/database");
const {
	getUserData,
	insertIntoUserDatabase,
	insertIntoBistandDatabase,
	getUserText,
	deleteUser,
	checkForExistingUser,
	sendMail,
} = require("./database/services");
const { isAuthenticated } = require("./middleware/authMiddleware");

// konfigurerer EJS som malmotor.
app.set("view engine", "ejs");
// serverer statiske filer.
app.use(express.static("public"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

app.use(expressLayouts);

app.set("layout", "partials/master");

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false, maxAge: 30000000000 },
	})
);

// Middleware for å få tilgang til session i navbar for å rendre logg ut knapp.
app.use((req, res, next) => {
	// res.locals er et objekt som EJS automatisk har tilgang til
	res.locals.session = req.session;
	next();
});

// parse application/json
app.use(bodyParser.json());

// Definerer hva som skal skje når vi får inn en forespørsel (req) med GET motode i http header
app.get("/", async (req, res) => {
	res.render("index", { pageStyles: "/css/index.css" });
});

app.get("/info", async (req, res) => {
	res.render("info");
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.post("/signup", async (req, res) => {
	const connection = await createConnection();
	const { email, password } = req.body;
	const hashedPassword = bcrypt.hashSync(password, saltRounds);
	const checkForUser = await checkForExistingUser(connection, email);
	if (checkForUser) {
		return res.redirect("/existingUser");
	}
	await insertIntoUserDatabase(connection, email, hashedPassword);
	const emailText =
		"Tusen takk for at du har registrert deg! Velkommen til oss!";
	await sendMail(email, "Velkommen", emailText);
	res.redirect("/signin");
});

app.get("/signin", (req, res) => {
	res.render("signin");
});

app.post("/signin", async (req, res) => {
	const connection = await createConnection();
	const { email, password } = req.body;
	const dbUserInfo = await getUserData(connection, email);
	if (dbUserInfo[0] === undefined) {
		return res.redirect("/signin");
	}
	if (!bcrypt.compareSync(password, dbUserInfo[0].password)) {
		return res.redirect("/signin");
	}
	req.session.email = email;

	const emailText =
		"Velkommen ti din fantstiske konto her hos oss! Nå som du er logget inn kan du gjøre alt du har drømt om. Om du ønsker å slette kontoen din må dette gjøres før du har sendt inn spørsmål. /n Dersom du har sendt inn spørsmål må du kontakte IT-avdeling for å be om sletting av konto. ";
	sendMail(email, "Første innlogging", emailText);

	return res.redirect("/dashboard");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
	res.render("dashboard", { pageStyles: "/css/dashboard.css" });
});

app.get("/dashboard/bistand", isAuthenticated, async (req, res) => {
	const connection = await createConnection();
	const email = req.session.email;
	const userText = await getUserText(connection, email);
	res.render("bistand", { text: userText });
});

app.post("/dashboard/bistand", isAuthenticated, async (req, res) => {
	const connection = await createConnection();
	const email = req.session.email;
	const text = req.body.text;

	insertIntoBistandDatabase(connection, text, email);
	const emailText =
		"Du har nå sendt inn en henvendelse til oss. Din henvendelse lyder som følger:" +
		`${text}` +
		"Om det er feil vennligst ta kontakt med IT-avdelingen.";
	res.redirect("/dashboard/bistand");
});

app.post("/dashboard/delete", isAuthenticated, async (req, res) => {
	const connection = await createConnection();
	deleteUser(connection, req.session.email);
	req.session.destroy();
	res.redirect("/signin");
});

app.get("/existingUser", (req, res) => {
	res.render("existingUser");
});

app.get("/logout", (req, res) => {
	res.clearCookie("connect.sid"); // Fjerner cookie fra klienten når den logger ut fra siden
	req.session.destroy();
	res.redirect("/");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
