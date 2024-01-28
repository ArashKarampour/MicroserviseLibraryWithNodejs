const express = require("express");
const router = express.Router();
const { Book,validateBook,isValidBookId } = require("../models/book");
const amqp = require("amqplib");


let connection,channel;
async function connectRBMQ(){
    try{
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();       
        //updateBook:
        await channel.assertQueue("updateBook");        
        channel.consume("updateBook",async (msg) => {
          const book = JSON.parse(msg.content.toString());   

          if(!book.numberInStock && book.numberInStock !== 0)
            await Book.findByIdAndUpdate(book._id,{$inc:{numberInStock:+1}});
          else{
            await Book.findByIdAndUpdate(book._id,{$set:{numberInStock:book.numberInStock}});          
          }  
          channel.ack(msg);
          console.log("book updated");
        }); 
        
        process.on("beforeExit",async ()=>{
            await channel.close();
            await connection.close();
        });
    }catch(e){
        console.error(e);        
    }
}
connectRBMQ();

//books router

router.get('/', async (req,res) => {
    const books = await Book.find();
    res.send(books);
});

router.get("/:id", async (req,res) => {
    if(!isValidBookId(req.params.id))
        return res.status(400).send("Invalid Book ID !");
    
    try{
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).send('book was not found!');
        return res.send(book);
    }catch(e){
        console.error(e);
        return res.status(500).send("Something faild in Books service\nWe thank you for your Understanig!");
    }
});


router.post("/add", async (req,res) => {
    
    const { error } = validateBook(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const book = new Book({
        title : req.body.title,
        author: req.body.author,
        pages: req.body.pages,
        publisher: req.body.publisher,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    
    // try{
        await book.save();
        console.log("book added:",book);
        return res.send(`Book added: ${book}`);        
    // }catch(e){
    //     console.error(e);
    //     return res.status(500).send("Something faild in Books service\nWe thank you for your Understanig!");
    // }
   
});

router.put('/:id', async (req,res) => {
    if(!isValidBookId(req.params.id))
        return res.status(400).send("Invalid Book ID !");

    const { error } = validateBook(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const book = await Book.findByIdAndUpdate(req.params.id,{
        $set:{
            title: req.body.title,
            author: req.body.author, 
            pages: req.body.pages,
            publisher: req.body.publisher,          
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
        }
    }, { new : true});

    if(!book) return res.status(404).send('book not found');

    res.send(book);

});

router.delete('/:id', async (req,res) => {
    if(!isValidBookId(req.params.id))
        return res.status(400).send("Invalid Book ID !");
        
    const book = await Book.findByIdAndRemove(req.params.id);

    if(!book) return res.status(404).send('book was not found!!!');

    res.send(book);

});





module.exports = router;