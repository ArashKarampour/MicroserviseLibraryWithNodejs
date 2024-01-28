const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const passwordComplexity = require("joi-password-complexity");
// https://www.npmjs.com/package/joi-password-complexity
// https://stackoverflow.com/questions/60162830/how-can-i-implement-joi-password-complexity-in-joi-validation
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true, // we set this so every email must be unique
    trim: true,
    minlength: 10,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    maxlength: 1024,
  },
  isAdmin:{
     type:Boolean,
     required:false,
     default:false
    }
});

userSchema.methods.generateAuthToken = function () {
  // we must use function keyword and not the arrow function here.cause we need to access the this related to the object. in fact every time we want to add a method that is part of an object we should use function and not arrow function syntax
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey"),
    {
      expiresIn: "1h",
    }
  );
  return token; // this this here refers to the user object that will call it's generateAuthToken method
};

const User = mongoose.model("users", userSchema);

function validateUser(user) {
  const complexityOption = {
    // this is used in passComp for password complexity check
    min: 6,
    max: 255,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 3, // it means: Password must meet at least 4 of the complexity requirements(lower,upper,numeric,symbol are our complexity options. note that the lenght must be also greater than 8)
  };

  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(10).max(100).required().email(), // we used .email for ensuring that this is a email    
    password: passwordComplexity(complexityOption, "the Password").required(),
    isAdmin: Joi.boolean().default(false)
  });

  return schema.validate(user);
}

// function checkPassComplexity(pass){
//     const complexityOption = {
//         min: 8,
//         max: 255,
//         lowerCase: 1,
//         upperCase: 1,
//         numeric: 1,
//         symbol: 1,
//         requirementCount: 4 // it means: Password must meet at least 4 of the complexity requirements(lower,upper,numeric,symbol are our complexity options. note that the lenght must be also greater than 8)
//     };
//     return passwordComplexity(complexityOption,'the Password').validate(pass);
// }

module.exports.User = User;
module.exports.validate = validateUser;
//module.exports.passValidate = checkPassComplexity;
