const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));

// app.engine("hbs", exphbs({defaultLayout : "main",
//                           extname       : ".hbs"}));

app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.redirect("login");
})

app.get("/login", (req, res) => {
  res.render("login.hbs");
})

app.get("/profile", (req, res) => {
  res.render("profile.hbs");
})

app.get("/register", (req, res) => {
  res.render("signUp.hbs");
})

app.listen(port, () => {
  console.log(`Web server up on port ${port}`);
})
