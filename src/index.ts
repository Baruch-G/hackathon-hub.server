import app from "./app";
import https from "https";
import http from "http";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

app().then((app: any) => {
  const port = process.env.PORT || 6969;
  console.log("Development mode");
  http.createServer(app).listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
