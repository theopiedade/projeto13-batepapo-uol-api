import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
dayjs().format();

// DB Connection init
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
	console.log('MongoDB Connected!');
} catch (err) {
  console.log(err.message);
}

const db = mongoClient.db();
// DB Connection end

// JOI Schemas init 
const nameSchema = joi.object({
    name: joi.string().required()
});

const msgSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid("message", "private-message").required(),
});
// JOI Schemas end

 app.post('/participants', async (req, res) => {
    const name = req.body.name;
        
    const validate = nameSchema.validate(req.body, { abortEarly: false })
    if (validate.error) return res.sendStatus(422)

    const checkname = await db.collection('participants').findOne({name})
    if (checkname) return res.sendStatus(409);
    
    const user = {
        name: name,
        lastStatus: Date.now()
    }


     const msg = {
         from: name,
         to: 'Todos',
         text: 'entra na sala...',
         type: 'status',
         time: dayjs(Date.now()).format('HH:mm:ss')
     }

    try {
        await db.collection('participants').insertOne(user);
        await db.collection('messages').insertOne(msg);
        res.sendStatus(201);
        return
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

  app.post('/messages', async (req, res) => {
        const {to, text, type} = req.body;
        const from = req.headers.user;
        let time = dayjs(Date.now()).format('HH:mm:ss');

        const msg = {
            from: from,
            to: to,
            text: text,
            type: type,
            time: time
        }
        // to e text devem ser strings não vazias.
        // type só pode ser message ou private_message.
        const validate = msgSchema.validate(msg, { abortEarly: false })
        if (validate.error) return res.sendStatus(422);

        // from é obrigatório e deve ser um participante existente na lista 
        // de participantes (ou seja, que está na sala).
        const checkname = await db.collection('participants').findOne({from})
        if (!checkname) return res.sendStatus(422);
    try {
      const message = await db.collection('messages').find().toArray();
      res.send(message);
      res.sendStatus(201);
    } catch (error) {
      console.error(error);
      res.sendStatus(422);
    }
  });

  app.get('/messages', async (req, res) => {
    const user = req.headers.user;
    const limit = parseInt(req.query.limit);
    try {
      const messages = await db.collection('messages').find({
        to: "Todos", $or: [ {to: user}], $or: [ {from: user}]
        }).toArray();

      if (limit == undefined || limit <= 0) return res.sendStatus(422);
      else {
        messages.slice(-1*limit);
        res.send(messages);
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  app.post('/status', async (req, res) => {
    const user = req.headers.user;
    if (!user) return res.sendStatus(404);

    const checkname = await db.collection('participants').findOne({ _name: new user })
    if (!checkname) return res.sendStatus(404);

    const userEdit = {
      name: user,
      lastStatus: Date.now()
  }
    try {
      await db.collection("participants")
      .updateOne({ _name: new user }, { $set: userEdit});
  
      return res.sendStatus(200);

    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))