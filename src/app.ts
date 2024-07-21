import { Request, Response } from "express";
import hackathonRoutes from "./routes/hackathon_routes";
import authRoutes from "./routes/auth_route";
import fileRoute from "./routes/file_route";
import dotenv from "dotenv";
import mongoose from "mongoose";
import express, { Express } from "express";
import bodyParser from "body-parser";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

dotenv.config();

const app = (): Promise<Express> => {
  return new Promise<Express>((resolve, reject) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error) => {
      console.error(error);
      reject(error);
    });

    const url = process.env.DB_URL || "mongodb://0.0.0.0:27017/hackathon";
    mongoose
      .connect(url!)
      .then(() => {
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use((req, res, next) => {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Methods", "*");
          res.header("Access-Control-Allow-Headers", "*");
          res.header("Access-Control-Allow-Credentials", "true");
          next();
        });

        app.get("/", (req: Request, res: Response) => {
          res.send("Hello world");
        });
        app.use("/hackathon", hackathonRoutes);
        app.use("/public", express.static("public"));
        app.use("/auth", authRoutes);
        app.use("/file", fileRoute);
        app.use("/media",express.static('public'));

        //         const swaggerOptions = {
        //   definition: {
        //     openapi: "3.0.0",
        //     info: {
        //       title: "Web Advanced Application Development 2023 REST API",
        //       version: "1.0.1",
        //       description: "REST server including authentication using JWT and refresh token",
        //     },
        //     servers: [{ url: "http://localhost:6969" }],
        //   },
        //   apis: ["./routes/*.ts"],
        // };

        // const swaggerSpecs = swaggerJsDoc(swaggerOptions);
        // app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

        resolve(app);
      })
      .catch((error) => reject(error));
  });
};

export default app;
