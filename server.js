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

app.get("/admin", auth, (req, res) => {
    res.status(200).sendFile(__dirname + "/public/admin.html");
});

app.post("/login", async (req, res) => {
    fs.readFile(
        path.join(__dirname, "users.json"),
        async (err, fileContent) => {
            const users = JSON.parse(fileContent);
            const user = users.find((user) => user.name == req.body.userName);
            if (!user)
                return res
                    .status(404)
                    .json({ msg: "Rossz azonosítónév!", logged: false });

            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (!validPassword)
                return res
                    .status(404)
                    .json({ msg: "Rossz jelszó!", logged: false });

            const tokenPayLoad = {
                username: user.name,
            };

            const accessToken = jwt.sign(tokenPayLoad, process.env.SECRET_KEY);

            const now = new Date();
            now.setMinutes(
                now.getMinutes() + parseInt(process.env.USER_ACCESS_MIN)
            );
            res.cookie("auth_token", accessToken, {
                path: "/",
                expires: now,
                httpOnly: true,
            });

            res.status(200).json({ logged: true });
        }
    );
});

app.get("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.redirect("/");
});

app.get("/orderList", (req, res) => {
    fs.readFile(path.join(__dirname, "rendelesek.json"), (err, fileContent) => {
        const rendelesek = JSON.parse(fileContent);
        res.status(200).end(JSON.stringify(rendelesek));
    });
});

app.delete("/rendeles/:id", (req, res) => {
    fs.readFile(path.join(__dirname, "rendelesek.json"), (err, fileContent) => {
        const rendelesek = JSON.parse(fileContent);
        const deleteIndex = rendelesek.findIndex(
            (rendeles) => rendeles.id == req.params.id
        );

        rendelesek.splice(deleteIndex, 1);

        fs.writeFile(
            path.join(__dirname, "rendelesek.json"),
            JSON.stringify(rendelesek, null, "\t"),
            (err) => {
                res.json({ deleted: "ok" });
            }
        );
    });
});

app.patch("/rendeles/:id", (req, res) => {
    console.log(req.body);
    fs.readFile(path.join(__dirname, "rendelesek.json"), (err, fileContent) => {
        const rendelesek = JSON.parse(fileContent);
        const rendeles = rendelesek.find((rend) => rend.id == req.params.id);

        rendeles[req.body.name] = req.body.send;
        rendeles.price -= rendeles[req.body.name + "Price"];
        rendeles[req.body.name + "Price"] = 0;

        fs.readFile(path.join(__dirname, req.body.file), (error, fileCt) => {
            const elemek = JSON.parse(fileCt);
            //if(req.body.send != [])
            req.body.send.forEach((adat) => {
                let elem = elemek.find((e) => e.name == adat);
                rendeles[req.body.name + "Price"] += elem.price;
            });

            rendeles.price += rendeles[req.body.name + "Price"];

            fs.writeFile(
                path.join(__dirname, "rendelesek.json"),
                JSON.stringify(rendelesek, null, "\t"),
                (err) => {
                    res.json({ modified: "ok" });
                }
            );
        });
    });
});

app.listen(process.env.PORT);
