const express = require("express");
const app = express();
const cors = require("cors");
const proxy = require("express-http-proxy");
const authMid = require("./middleware/authMid");
const config = require("config");

try{
    if (!config.get("jwtPrivateKey")) {
        throw new Error("FATAL ERROR : jwtPrivateKey is not defined");            
    }
}catch(e){
    console.error("FATAL ERROR : jwtPrivateKey is not defined");
    process.exit(1);
}

app.use(cors());// using cors for cros origins(for different domains (or ports))
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/", (req,res) => {
    //res.send("<div><a href='/api/books-service'>Books</a> <a href='/api/customers-service'>Customers</a> <a href='/api/rentals-service'>Rentals</a><div>")
    res.send("Run with Postman for test.");
});

app.use("/api/users-service",proxy("http://localhost:3004"));
app.use(authMid);
app.use("/api/books-service",proxy("http://localhost:3001"));
app.use("/api/customers-service",proxy("http://localhost:3002"));
app.use("/api/rentals-service",proxy("http://localhost:3003"));



app.listen(3000, () => console.log("Listening on port 3000 proxy gateway"));



