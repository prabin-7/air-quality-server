import express from "express"
import cors from "cors";
import nodemailer from "nodemailer";
import "reflect-metadata"
import { AppDataSource } from "./data-source";
import { ExhaustQuality } from "./entities/ExhaustQuality";
import http from "http";
import { Server } from "socket.io";

const app = express()
const PORT = process.env.PORT || 3000;
let countToSaveInDB = 0;

const MAX_SMOKE = 100;
const MAX_LPG = 100;
const MAX_CO = 25;

// Parser MiddleWare
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);


// Database Setup
AppDataSource.initialize()
    .then(() => {
        console.log("connected to DB")
    })
    .catch((error) => console.log(error))

// Email setup
 const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.SMPT_EMAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
  });
  
  transporter
    .verify()
    .then(() => console.log("TRANSPORTER VERIFIED"))
    .catch(console.error);

app.use(
    cors({
      origin: process.env.CLIENT_ENDPOINT,
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );

// // Socket
// const io = new (Server as any)(server, {
//   cors: {
//       
//   }
// })

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ENDPOINT,
    methods: ["GET", "POST"]
  }
});




app.post("/", async (req,res) => {
    const data = req.body as {
      lpg_val: string,
      smoke_val: string,
      co_val: string
    }

    console.log(data)

    try {

    const gasData = await ExhaustQuality.find({
      take: 10,
      order: {
        created_at:  "DESC"
      }
    })
    io.sockets.emit("tableData", gasData)
    io.sockets.emit("sensorData", data)
  } catch (e) {
    console.log("Failed to send data")
    console.error(e)
  } 
    if(countToSaveInDB === 10 ||
        parseFloat(data.lpg_val) >= MAX_LPG || 
        parseFloat(data.smoke_val) >= MAX_SMOKE || 
        parseFloat(data.co_val) >= MAX_CO) {

      // save to DB
      try {
      await ExhaustQuality.create({
        smoke: parseFloat(data.smoke_val),
        lpg: parseFloat(data.lpg_val),
        co: parseFloat(data.co_val)
      }).save()
    } catch (e) {
      console.log("Failed to add data to DB")
      console.error(e)
    }
      console.log("SAVED")
      countToSaveInDB = 0
    }
    if(
        parseFloat(data.lpg_val) >= MAX_LPG || 
        parseFloat(data.smoke_val) >= MAX_SMOKE || 
        parseFloat(data.co_val) >= MAX_CO
        ) 
    {
      // SEND MAIL
        transporter
      .sendMail({
        from: process.env.SMPT_EMAIL, // sender address
        to: "prabinneupane2001@gmail.com", // list of receivers
        subject: "Alert Mail", // Subject line
        text: `THRESHOLD LIMIT EXCEEDED !!!
                DATA: 
                    Smoke: ${data.smoke_val} ppm,
                    LPG: ${data.lpg_val} ppm,
                    Co: ${data.co_val} ppm
        
        `, // plain text body
      })
      .then((info) => {
        console.log({ info });
      })
      .catch(console.error);
    } 
    countToSaveInDB = countToSaveInDB + 1;
    res.json({
        status: "ok"
    })

})

app.get("/", (_,res) => {
    res.json({
        status: "ok"
    })
})

server.listen(PORT, () => {
    console.log("SERVER RUNNING AT", PORT)
})