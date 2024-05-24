import { Request, Response } from "express";
import hackathonRoutes from "./router/hackathon_routes";
import dotenv from "dotenv";
import express from 'express';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.use("/hackathon", hackathonRoutes)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
