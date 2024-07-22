import { Request } from "express";
import express from "express"
import path from "path"
import multer from "multer";

const app = express();

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: any, cb: any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up multer middleware
const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
