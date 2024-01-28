require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");

module.exports = function () {
  //for logging errors on console      
    winston.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.prettyPrint(),
          winston.format.simple()
        ),
        handleExceptions: true, // option for logging uncaught exceptions on console
        handleRejections: true, // option for logging unhandled rejections on console
        //options: { colorize: true, prettyPrint: true },
      })
    );
  
    //winston.exitOnError = false; //default is true (for exiting after loging the exception or rejection)
    //another way for logging uncaught exceptions and unhandled rejections is to use the winston intead of using process object(for seperating the normal log file from uncaught exceptions and unhandled rejections we use another file and collection here)
    winston.exceptions.handle(
      new winston.transports.File({
        filename: "./logs/UncaughtEx-UnhandledRej.log",
      }),
      new winston.transports.MongoDB({
        db: "mongodb://localhost/Library-MS-books",
        options: {
          useUnifiedTopology: true, //this is for using the newer mongodb driver and removing the warning in console.
          poolSize: 2, //these three last in options are the default options see the winston-mongodb in npm site.
          //autoReconnect: true, // we should remove this line so that the useUnifiedTopology option above works and gives no more warning in console
          useNewUrlParser: true,
        },
        collection: "logs-exceptions-rejections",
        //level: "error",
        metaKey: "trace",
      })
    );
    // solution for bug of the winston.rejections.handle:
    process.on("unhandledRejection", (ex) => {
      throw ex; //this will throw an exception for our rejection and our winston exception handler will catch it!
    });
  
    //for logging errors in a log file(in a json format)
    winston.add(
      new winston.transports.File({
        filename: "./logs/logfile.log",
        // handleRejections: true,
        // handleExceptions: true
      })
    );
  
    //to save error logs in mongodb we use below line after using winston itself. with winston-mongodb library
    winston.add(
      new winston.transports.MongoDB({
        db: "mongodb://localhost/Library-MS-books",
        options: {
          useUnifiedTopology: true, //this is for using the newer mongodb driver and removing the warning in console.
          poolSize: 2, //these three last in options are the default options see the winston-mongodb in npm site.
          //autoReconnect: true, // we should remove this line so that the useUnifiedTopology option above works and gives no more warning in console
          useNewUrlParser: true,
        },
        collection: "logs-winston",
        level: "error",
      })
    );

};
