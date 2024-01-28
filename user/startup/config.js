const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    //we throw an error and our error handler will get and log it
    throw new Error("FATAL ERROR : jwtPrivateKey is not defined");
    // it returns an empty string if LibMS_jwtPrivateKey is not set as an environment variable.("" is falsy)
    //we commented these two bellow lines cause we want to log them in our log file or db or console
    // console.error("FATAL ERROR : jwtPrivateKey is not defined");
    // process.exit(1);
  }
};
