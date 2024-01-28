const { Customer, validate,isValidCustomerId } = require("../models/customer"); // sets .Customer to Customer and .validate to validate (object destructring in javascript)
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find();
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  if(!isValidCustomerId(req.params.id))
    return res.status(400).send("Invalid Customer ID !");

  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res.status(404).send("Customer with the gven id was not found");

  res.send(customer);
});

router.post("/add", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer;
  //try {
    customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold,
    });

    customer = await customer.save();
  // } catch (err) {
  //   res.send(`customer could not save with error: ${err}`);
  // }

  res.send(customer);
});

router.put("/:id", async (req, res) => {
  if(!isValidCustomerId(req.params.id))
    return res.status(400).send("Invalid Customer ID !");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold,
    },
    { new: true }
  );

  if (!customer) return res.status(404).send("customer not found");

  res.send(customer);
});

router.delete("/:id", async (req, res) => {
  if(!isValidCustomerId(req.params.id))
    return res.status(400).send("Invalid Customer ID !");

  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send("customer not found");

  res.send(customer);
});


module.exports = router;
