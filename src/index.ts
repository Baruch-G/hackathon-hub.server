import app from "./app";
import https from 'https';
import http from 'http';
import fs from 'fs';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

app().then((app: any) => {
  const port = process.env.PORT || 6969;
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
