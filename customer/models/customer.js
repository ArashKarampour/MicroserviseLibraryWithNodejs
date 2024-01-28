const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model('customers',new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,              
    },
    phone: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20
    },
    isGold: {
        type: Boolean,
        default: false
    }

}));

function validateCustomer(customer){
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.string().min(6).max(20).required(),
        isGold: Joi.boolean().default(false)
    });

    return schema.validate(customer);
}

function isValidCustomerId(customerId){
    return mongoose.isValidObjectId(customerId);       
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
module.exports.isValidCustomerId = isValidCustomerId;