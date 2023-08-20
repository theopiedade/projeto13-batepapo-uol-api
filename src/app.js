import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';

const app = express();
app.use(express.json());
app.use(cors);
dotenv.config();

const userSchema = joi.object({
    name: joi.string().required(),
    laststatus: joi.date().required()
});

const msgSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required(),
    time: joi.string().required()
});

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
 .then(() => db = mongoClient.db())
 .catch((err) => console.log(err.message));




const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))