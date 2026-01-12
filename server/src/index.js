import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import { requirePageUser } from "./middleware/requirePageUser.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static("public"));
app.use(express.json()); 
app.use(cookieParser()); 
app.use("/api/auth", authRouter);
app.use((req, res, next) => {
  res.locals.isAuthPage =
    req.path === "/login" || req.path === "/register";
  next();
});

app.get(["/", "/home"], requirePageUser, (req, res) => {res.render("home")});
app.get("/login", (req, res) => {res.render("login")});
app.get("/register", (req, res) => {res.render("register")});

app.listen(PORT , () => {
  console.log(`Ultimate Dungeon is Listening on port ${PORT}`);
}); 