const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const User = require("./models/user.js");
const mongoose = require("./db/mongoose.js");
const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const bcrypt = require("bcryptjs");
const exphbs = require("express-handlebars");

//session cookie
// const session = require("express-session");
// const flash = require("connect-flash");

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {secure: false}
// }));
//
// app.use(flash());

const port = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));

app.engine("hbs", exphbs({defaultLayout : "main",
                          extname       : ".hbs"}));

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
    // req.flash('errorMessages', errorMessages);
    // return res.redirect("/register");
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

app.post("/login", (req, res) => {
  console.log("Post login route hit");
  User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          console.log("This email does not exist.");
          return res.redirect("/login");
        } else {
          console.log(user);
          console.log(req.body.password, user.password);
          bcrypt.compare(req.body.password, user.password)
            .then(passwordIsValid => {
              console.log("Password is valid: ", passwordIsValid);
              if(passwordIsValid) {
                console.log("success");
                res.redirect("/profile");
              } else {
                console.log("Invalid Password");
                res.redirect("/login");
              }
            })
            .catch(e => {
              console.log(e);
            })
        }
      })
      .catch(e => {
        console.log("Error");
        return res.redirect("/login");
      })
})

app.listen(port, () => {
  console.log(`Web server up on port ${port}`);
})
