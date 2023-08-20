import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';

const app = express();
app.use(express.json());
app.use(cors);
dotenv.config();

const nameSchema = joi.object({
    name: joi.string().required()
});

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

 app.post('/participants', async (req, res) => {
    try {
        const name = req.body;
        
        const validate = nameSchema.validate(name, { abortEarly: false })
        if (validate.error) return res.sendStatus(422)

        const checkname = await db.collection('participants').findOne({ _name: new name })
        if (checkname) return res.sendStatus(409);
        
        const user = {
            name: name,
            lastStatus: Date.now()
        }

        await db.collection('participants').insertOne(user);
  
      res.sendStatus(201);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  })


const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))