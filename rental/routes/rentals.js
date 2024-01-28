const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Rental,validate } = require('../models/rental');
const axios = require("axios").default;
const amqp = require("amqplib");

let connection,channel;
async function connectRBMQ(){
    try{
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();       
        //await channel.assertQueue("updateBook");
        process.on("beforeExit",async ()=>{
            await channel.close();
            await connection.close();
        });
    }catch(e){
        console.error(e);        
    }
}
connectRBMQ();

router.get('/', async (req,res) => {
    const results = await Rental.find().sort('-dateOut');
    res.send(results);
});

router.post('/add', async (req,res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    // we need to also validate the id that we pass to findById first else we will get an error in console // see video 10 part 9 nodejs from mosh
    try{
        const customer = await axios.get(`http://localhost:3002/${req.body.customerId}`);
        if(!customer.data._id) return res.status(404).send('Invalid customer!');
        
        const book = await axios.get(`http://localhost:3001/${req.body.bookId}`);
        if(!book.data._id) return res.status(404).send('Invalid book!');

        if(book.data.numberInStock === 0) return res.status(400).send('book not in stock');

        let rental = new Rental({
            customer:{
                _id: customer.data._id,
                name: customer.data.name,
                phone: customer.data.phone,
                isGold: customer.data.isGold
            },
            book: {
                _id: book.data._id,
                title: book.data.title,
                dailyRentalRate: book.data.dailyRentalRate            
            }
        });
    
        
        rental = await rental.save();
        //some RabbitMQ stuff goes here:
        book.data.numberInStock--;
        channel.sendToQueue("updateBook",Buffer.from(JSON.stringify(book.data)));
        // await movie.save();
    
        res.send(rental);
        console.log(book.data);
        console.log(customer.data);
        // res.send([book.data,customer.data]);
    }catch(e){
        console.error(`book or customer was not found or Something faild:${e}`);
        return res.status(400).send(`book or customer was not found or Something faild:${e}`);
    }
    
       
    
});


router.put('/end/:id', async (req,res) => {
    
    if(!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send("Rental ID is not valid!");

    let rental = await Rental.findById(req.params.id);
    if(!rental) return res.status(404).send("Rental not Found!");

    if(rental.rentalFee || rental.rentalFee === 0)
        return res.send("Already calculated and book returned!");

    const book = rental.book;
    
    //calculate the rental cost:
    rental.dateReturned = new Date();
    const dateOut = rental.dateOut;

    rental.rentalFee = ((rental.dateReturned.getFullYear() - dateOut.getFullYear())*365 + (rental.dateReturned.getMonth() - dateOut.getMonth())*30 + (rental.dateReturned.getDate() - dateOut.getDate()))*book.dailyRentalRate;
    
    rental = await rental.save();
    //some RabbitMQ stuff goes here:
    // book.numberInStock++;
    channel.sendToQueue("updateBook",Buffer.from(JSON.stringify(book)));
    // await movie.save();

    //await Rental.findByIdAndRemove(rental._id);
    
    
    res.send(`Rental Fee: ${rental.rentalFee}`);
    console.log((`Rental Fee: ${rental.rentalFee}`));
    //console.log(book);
    
});



router.delete('/delete/:id', async (req,res) => {
    
    if(!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send("Rental ID is not valid!");
        
    const rental = await Rental.findById(req.params.id);    
    if(!rental) return res.status(404).send("Rental not Found!");

    const book = rental.book;
    await Rental.findByIdAndRemove(rental._id);
                
    //some RabbitMQ stuff goes here:
    // book.numberInStock++;
    channel.sendToQueue("updateBook",Buffer.from(JSON.stringify(book)));
    // await movie.save();

    
    res.send(rental);
    //console.log(book);
    
});


module.exports = router;