const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  classes: {
    type: Array,
    items: {
      type: Object,
      properties: {
        name: {
          type: String,
          unique: true
        },
        gradeNow: {
          type: Number
        },
        gradeWant: {
          type: Number
        },
        percentTest: {
          type: Number
        },
        final: {
          type: Number
        }
      }
    }
  }
})

userSchema.pre("save", function(next) {
  const user = this;
  if(user.isModified("password")) {
    bcrypt.hash(user.password, 10)
      .then(hashedPassword => {
        user.password = hashedPassword;
        next();
      })
      .catch(e => {
        console.log(`User ${user} failed to hashPassword;`, e);
        next();
      })
  }
})

const User = mongoose.model("User", userSchema);

module.exports = User;
