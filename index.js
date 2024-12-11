import express from "express";
import userRoute from "./routes/userRoutes.js";
import dbConnection from "./db/conn.js";

const app = express();
const port = 419;
dbConnection();
app.use(express.json()); // parse json request body

app.use("/api/v1/users", userRoute); // use "/api/v1/users" for all user routes

app.get("/", (req, res) => {
  res.send("hello welcome to my personal api server");
});

app.listen(port, () => {
  console.log(`server is listening on port http://localhost:${port}`);
});
