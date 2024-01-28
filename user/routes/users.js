const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const lodash = require("lodash");
const bcrypt = require("bcrypt");
//also you can this link for possible changes and more infos:  https://www.npmjs.com/package/bcrypt
const authMid = require("../middlewares/authMid");

router.get("/me", authMid, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/signup", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User is already registered");

    user = new User(lodash.pick(req.body, ["name", "email", "password","isAdmin"]));

    // for generating random number between two number inclusive of the both. see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    const randomNum = Math.floor(Math.random() * (10 - 5 + 1) + 5); // generating random number between 5 and 10 inclusive of both 5 and 10
    // hashing the password with bcrypt lib
    const salt = await bcrypt.genSalt(randomNum);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();
    //res.send(user);

    //const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
    const token = user.generateAuthToken();
    res.header("x-auth-token", token); //instead of header we can use cookies with res.cookie but now in postman we use httpheader instead
    // second way to exclude password and other properties:
    res.send(lodash.pick(user, ["_id", "name", "email","isAdmin"]));
  } catch (e) {
    console.error(e);
    res.status(500).send("something faild please try again after a while");
  }
});

module.exports = router;
