const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const User = require("./models/user.js");
const mongoose = require("./db/mongoose.js");
const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const port = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));

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

app.post("/register", [
    body("email")
      .isEmail()
      .withMessage("Invalid email address."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("Password must contain at least one digit")
  ],
(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(obj => {
      return {message: obj.msg};
    });
    console.log("Original Errors:", errors.array());
    console.log("Mapped Errors:", errorMessages);
  }

  const userData = matchedData(req);
  console.log(userData);
  const user = new User(userData);
    user.save()
        .then(user => {
          res.redirect("/login");
        })
        .catch(e => {
          if(e.code === 11000) {
            console.log("Duplicate email.");
          }
          res.redirect("/register");
        })
})

app.listen(port, () => {
  console.log(`Web server up on port ${port}`);
})
