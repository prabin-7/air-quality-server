"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
require("reflect-metadata");
const data_source_1 = require("./data-source");
const ExhaustQuality_1 = require("./entities/ExhaustQuality");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const PORT = 3000;
let countToSaveInDB = 0;
const MAX_SMOKE = 100;
const MAX_LPG = 1000;
const MAX_CO = 25;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const server = http_1.default.createServer(app);
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("connected to DB");
})
    .catch((error) => console.log(error));
const transporter = nodemailer_1.default.createTransport({
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
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ENDPOINT,
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_ENDPOINT,
        methods: ["GET", "POST"]
    }
});
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    console.log(data);
    const gasData = yield ExhaustQuality_1.ExhaustQuality.find({
        take: 10,
        order: {
            created_at: "DESC"
        }
    });
    io.sockets.emit("tableData", gasData);
    io.sockets.emit("sensorData", data);
    if (countToSaveInDB === 15 ||
        parseFloat(data.lpg_val) >= MAX_LPG ||
        parseFloat(data.smoke_val) >= MAX_SMOKE ||
        parseFloat(data.co_val) >= MAX_CO) {
        yield ExhaustQuality_1.ExhaustQuality.create({
            smoke: parseFloat(data.smoke_val),
            lpg: parseFloat(data.lpg_val),
            co: parseFloat(data.co_val)
        }).save();
        console.log("SAVED");
        countToSaveInDB = 0;
    }
    if (parseFloat(data.lpg_val) >= MAX_LPG ||
        parseFloat(data.smoke_val) >= MAX_SMOKE ||
        parseFloat(data.co_val) >= MAX_CO) {
        transporter
            .sendMail({
            from: "prasadrocket64@gmail.com",
            to: "prabinneupane2001@gmail.com",
            subject: "Verification Email",
            text: JSON.stringify(data),
        })
            .then((info) => {
            console.log({ info });
        })
            .catch(console.error);
    }
    countToSaveInDB = countToSaveInDB + 1;
    res.json({
        status: "ok"
    });
}));
app.get("/", (_, res) => {
    res.json({
        status: "ok"
    });
});
server.listen(PORT, () => {
    console.log("SERVER RUNNING AT", PORT);
});
//# sourceMappingURL=server.js.map