const express = require("express");
const books = require("../routes/books");
const error = require("../middlewares/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  app.use("/", books);
  app.use(error);
};
