const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { User } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send("Invalid email or password");

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password");

   
    const token = user.generateAuthToken();
    res.header("x-auth-token", token); //instead of header we can use cookies with res.cookie but now in postman we use httpheader instead
    //res.cookie("connect_id", token, { maxAge: 3600000, httpOnly: true });
    //res.clearCookie("connect_id", {}); //for logging out
    res.send(token);

  } catch (e) {
    console.error(e);
    res.status(500).send("something faild! please try again after a while.");
  }
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().email().min(10).max(100).required(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = router;
