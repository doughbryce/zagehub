const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const User = require("./models/user.js");
const mongoose = require("./db/mongoose.js");
const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const bcrypt = require("bcryptjs");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");

require("dotenv").config();

const session = require("express-session");
const flash = require("connect-flash");

const port = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));

app.engine("hbs", exphbs({defaultLayout : "main",
                          extname       : ".hbs"}));

app.set("view engine", "hbs");

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.errorMessages = req.flash('errorMessages');
  res.locals.successMessage = req.flash('successMessage');
  next();
})

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.redirect("/login");
})

app.get("/login", (req, res) => {
  res.render("login.hbs");
})

app.get("/profile", (req, res) => {
  console.log("userId:", req.session.userId);
  User.findById(req.session.userId)
    .then(user => {
      return res.render("profile.hbs", {
        username: user.username,
        classes: user.classes
      });
    })
    .catch(e => {
      console.log(e);
      res.redirect("/login")
    })
})

app.get("/register", (req, res) => {
  res.render("signUp.hbs");
})

app.post("/register", [
    body("username")
      .isLength({ min: 4 })
      .withMessage("Username must have at least 4 characters"),
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
    req.flash('errorMessages', errorMessages);
    return res.redirect("/register");
  }
  const userData = matchedData(req);
  console.log(userData);
  const user = new User(userData);
    user.save()
        .then(user => {
          req.flash('successMessage', {message: "Sign up successful!"});
          res.redirect("/login");
        })
        .catch(e => {
          if(e.code === 11000) {

            req.flash("errorMessages", {message: "Duplicate username"})
          }
          res.redirect("/register");
        })
})

app.post("/login", (req, res) => {
  console.log("Post login route hit");
  console.log(req.body.username);
  User.findOne({username: req.body.username})
      .then(user => {
        if (!user) {
          req.flash("errorMessages", {message: "This username does not exist."});
          return res.redirect("/login");
        } else {
          console.log(user);
          console.log(req.body.password, user.password);
          bcrypt.compare(req.body.password, user.password)
            .then(passwordIsValid => {
              console.log("Password is valid: ", passwordIsValid);
              if(passwordIsValid) {
                req.session.userId = user._id;
                console.log("success");
                res.redirect("/profile");
              } else {
                req.flash("errorMessages", {message: "Invalid password."});
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
        req.flash("errorMessages", {message: e});
        return res.redirect("/login");
      })
})

app.get("/logout", (req, res) => {
  console.log("Hit logout route");
  req.session.userId = undefined;
  res.redirect("/login");
});

app.get("/addclass", (req, res) => {
  if(req.session.userId == undefined) {
    res.redirect("/login");
  } else {
    res.render("addClass.hbs");
  }
})

const calculate = (gradeWant, gradeNow, percentTest) => {
  //Grade = Exam Worth × Exam Score + (100% − Exam Worth) × Current Grade
  let x = gradeWant - (1 - (0.01*percentTest)) * gradeNow;
  return x / (0.01*percentTest);
}

app.post("/addclass", (req, res) => {
  console.log(req.body);
  req.body.final = calculate(req.body.gradeWant, req.body.gradeNow, req.body.percentTest);
  console.log(req.body.final);
  console.log("userId:", req.session.userId);
  User.findById(req.session.userId)
    .then(user => {
      User.findByIdAndUpdate(
          user._id,
          {$push: {classes: req.body}},
          {safe: true, upsert: true},
          function(err, model) {
            console.log(err);
          }
      );
      res.redirect("/profile");
    })
    .catch(e => {
      console.log(e);
      res.redirect("/addclass");
    })
})

app.delete("/delete/:className", (req, res) => {
  console.log("hit delete route");
  // const className = req.params.className;
  // Class.findByIdAndRemove(id)
  //    .then(dog => {
  //      console.log("Successful delete");
  //      res.redirect("/dogs");
  //    })
  //    .catch(e => {
  //      res.status(500).send(e);
  //    })
})

app.listen(port, () => {
  console.log(`Web server up on port ${port}`);
})
