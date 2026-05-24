// Entry point of the Express application
// Author: Refaat
import express from "express";
import router from "./routers/ipAddressRouter.js";
import ipAddressRandomizer from "./middleware/ipAddressRandomizer.js";
import errorHandler from "./middleware/errorHandler.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true, path: "../.env" });

const app = express();

app.set("trust proxy", true);
app.use(express.json());

// bind middleware
app.use(ipAddressRandomizer);

// bind routers
app.use(router);

// todo: serve react application
app.get("/",  (request, response) => {
    response.status(200).json({ ip: request.ip, date: new Date().toISOString() });
});

//
app.use(errorHandler);

// hey! listen! 
app.listen(3000, (error) => {
    console.log(`Listening @ ${process.env.HOST}${process.env.PORT}`);
});
