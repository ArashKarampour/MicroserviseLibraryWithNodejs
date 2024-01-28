const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  //instead of header we can use cookies with cookie-parser library to read the cookies from the user request
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded; //decoded is the object of payload which we have used to make the jwt token that has the _id of the user in this case
    next();
  } catch (e) {
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;
