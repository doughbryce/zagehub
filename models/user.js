const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

//database validation
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      //takes value the user inputted
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  }
})

// pre = instance method, current instance of userSchema will
// call this method, refer to ourselves as 'this' --> why u use function()
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
