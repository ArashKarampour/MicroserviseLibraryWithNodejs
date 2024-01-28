const express = require("express");
const rentals = require("../routes/rentals");
const error = require("../middlewares/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  app.use("/", rentals);
  app.use(error);
};
