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

app.post("/szendvics", (req, res) => {
    fs.readFile(path.join(__dirname, "rendelesek.json"), (err, fileContent) => {
        const rendelesek = JSON.parse(fileContent);
        const rendeles = Object.assign(req.body);

        if (rendeles.id == 0)
            rendeles.id = rendelesek[rendelesek.length - 1].id + 1;

        rendelesek.push(rendeles);
        fs.writeFile(
            path.join(__dirname, "rendelesek.json"),
            JSON.stringify(rendelesek, null, "\t"),
            (err) => {
                res.json({ saved: "ok" });
            }
        );
    });
});

app.post("/login", (req, res) => {
    fs.readFile(path.join(__dirname, "users.json"), (err, fileContent) => {
        const users = JSON.parse(fileContent);
        users.forEach((user) => {
            if (user.name == req.body.userName) {
                bcrypt.compare(
                    req.body.password,
                    user.password,
                    (err, result) => {
                        if (result) {
                            fs.readFile(
                                path.join(__dirname, "public", "admin.html"),
                                (err, fileContent) => {
                                    res.status(200).end(fileContent);
                                }
                            );
                        }
                    }
                );
            }
        });
    });
});

app.listen(process.env.PORT);
