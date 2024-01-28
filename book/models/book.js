const mongoose = require("mongoose");
const Joi = require("joi");
// Joi.objectId = require("joi-objectid")(Joi);

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    author:{
        type:String, 
        required: true                                            
    },
    pages:{
        type:String,
        default:"unknown",
        required:false
    },
    publisher:{
        type:String,
        default:"unknown",
        required:false
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,        
        max: 255
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 300
    }      

});

const Book = mongoose.model("books",bookSchema);

function validateBook(book){
    const schema = Joi.object({
        title: Joi.string().min(3).max(256).required(),
        author: Joi.string().min(3).max(256).required(),
        pages: Joi.string().max(50000),
        publisher: Joi.string().max(256),
        numberInStock: Joi.number().min(0).max(255).required(),
        dailyRentalRate: Joi.number().min(0).max(300).required()
    });

    return schema.validate(book);
}

function isValidBookId(bookId){
    return mongoose.isValidObjectId(bookId);       
}

module.exports.Book = Book;
module.exports.validateBook = validateBook;
module.exports.isValidBookId = isValidBookId;