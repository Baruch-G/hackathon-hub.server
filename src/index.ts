import app from "./app";
import https from 'https';
import http from 'http';
import fs from 'fs';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

app().then((app: any) => {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Web Advanced Application Development 2023 REST API",
        version: "1.0.1",
        description: "REST server including authentication using JWT and refresh token",
      },
      servers: [{ url: "http://localhost:3000" }],
    },
    apis: ["./src/routes/*.ts"],
  };

  const swaggerSpecs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

  const port = process.env.PORT || 3000;
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode');
    http.createServer(app).listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } else {
    console.log('Production mode');
    const httpsOptions = {
      key: fs.readFileSync('../client-key.pem'),
      cert: fs.readFileSync('../client-cert.pem')
    };
    const httpsPort = process.env.HTTPS_PORT || 3443;
    https.createServer(httpsOptions, app).listen(httpsPort, () => {
      console.log(`Server running on https://localhost:${httpsPort}`);
    });
  }
});
