import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static("public"));


app.get("/", (req, res) => {res.render("home")});
app.get("/login", (req, res) => {res.render("login")});
app.get("/register", (req, res) => {res.render("register")});

app.listen(PORT , () => {
  console.log(`Ultimate Dungeon is Listening on port ${PORT}`);
}); 