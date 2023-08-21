import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();
app.use(express.json());
app.use(cors);
dotenv.config();
const dayjs = require('dayjs');
dayjs().format();


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
        
        //let time = dayjs().get('hour')+':'+dayjs().get('minute')+':'+dayjs().get('second');
        let time = dayjs(Date.now()).format('HH:mm:ss');

        const msg = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: time
        }
        await db.collection('messages').insertOne(msg);
  
      res.sendStatus(201);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  })

  app.get('/participants', async (req, res) => {
    try {
      const participants = await db.collection('participants').find().toArray();
      res.send(participants);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  

  const { senha, email, idade } = req.body

const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))