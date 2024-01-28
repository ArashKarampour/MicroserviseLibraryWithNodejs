"use strict";

const winston = require("winston");
const express = require("express");
const app = express();

//we should require logging first cause if an error occur during loding other files(or functions) then we can log them!
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 3003;
app.listen(port, () => winston.info(`listening on port ${port} ...`));

