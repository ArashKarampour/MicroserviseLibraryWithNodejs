
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);// see part 9 from nodejs video 10 this is for validating id in mongodb
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name:{
                type: String,
                required: true,
                minlength: 3,
                maxlength: 50,
                trim: true
            },
            phone:{
                type:String,
                required:true,
                minlength:6,
                maxlength:100
            },
            isGold:{
                type: Boolean,
                default: false
            }
        }),
        required: true        
    },

    book: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 100
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 300
            }

        }),
        required: true
    },

    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },

    dateReturned: {
        type: Date
    },

    rentalFee: {
        type: Number,
        min: 0
    }
});

const Rental = mongoose.model('rentals',rentalSchema);

function validateRental(rental){
    const schema = Joi.object({
        // customerId: Joi.string().required(),
        // movieId: Joi.string().required()        
        customerId: Joi.objectId().required(),
        bookId: Joi.objectId().required()
    });

    return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.validate = validateRental;