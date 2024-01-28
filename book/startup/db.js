const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect("mongodb://localhost/Library-MS-books")
    .then(() => winston.info("Connected to DB"));
  //   .catch((err) => console.error("Could not connect to DB : ", err));
};

//we deleted .catch cause the unhandled exeption management we'll get and log it for us and also terminates the process as well.
