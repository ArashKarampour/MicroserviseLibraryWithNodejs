const express = require("express");
const customers = require("../routes/customers");
const error = require("../middlewares/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  app.use("/", customers);
  app.use(error);
};
