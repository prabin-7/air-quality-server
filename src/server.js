import express from "express"
import cors from "cors";

const app = express()
const PORT = 3000;

app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );

app.post("/", (req,res) => {
    const data = req.body
    const url = req.baseUrl

    console.log(data, url)

    res.json({
        status: "ok"
    })

})

app.get("/", (_,res) => {
    res.json({
        status: "ok"
    })
})

app.listen(PORT, () => {
    console.log("SERVER RUNNING AT", PORT)
})