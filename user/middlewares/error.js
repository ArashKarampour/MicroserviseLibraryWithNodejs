const winston = require("winston");

module.exports = function (err, req, res, next) {
  //winston.error(err.message, err); //logging error using winston for console and log file with meta
  winston.error(err.message, {
    metadata: {
      // if we just set metadata to err it will work for mongodb but doesn't work for console and logfile but if we manually set the message name and stack property like below it will work for all of them properly
      message: err.message,
      name: err.name,
      stack: err.stack,
    },
  }); //for logging with meta in mongodb and console and logfile
  res.status(500).send("Something faild.");
};
