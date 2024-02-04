const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

function auth(req, res, next) {
    const token = req.cookies.auth_token;

    if (!token)
        return res.status(200).sendFile(__dirname + "/public/login.html");

    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
        if (err)
            return res.status(200).sendFile(__dirname + "/public/login.html");

        res.response = { success: true };
        next();
    });
}

app.get("/lepesek", (req, res) => {
    fs.readFile(path.join(__dirname, "steps.json"), (err, fileContent) => {
        let steps = JSON.parse(fileContent);
        res.status(200).end(JSON.stringify(steps));
    });
});

app.get("/elemek/:file", (req, res) => {
    fs.readFile(path.join(__dirname, req.params.file), (err, fileContent) => {
        let elemek = JSON.parse(fileContent);
        res.status(200).end(JSON.stringify(elemek));
    });
});

app.post("/szendvics", auth, (req, res) => {});

app.listen(process.env.PORT);
