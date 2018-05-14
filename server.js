const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const User = require("./models/user.js");
const mongoose = require("./db/mongoose.js");

const port = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));

// app.engine("hbs", exphbs({defaultLayout : "main",
//                           extname       : ".hbs"}));

app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname, "/public")));

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.redirect("/login");
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

app.post("/register", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password
  })
  user.save()
    .then(user => {
      console.log("SUCCESS!");
      res.redirect("/");
    })
    .catch(e => {
      console.log(e);
    })
})

app.listen(port, () => {
  console.log(`Web server up on port ${port}`);
})
