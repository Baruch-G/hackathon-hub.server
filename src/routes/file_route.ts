import express from "express";
const router = express.Router();
import multer from "multer";

const base = "http://localhost:6969/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.array("file"), function (req, res) {
  if (!req.files) {
    return res.status(400).send({ message: "No files uploaded" });
  }

  const files = req.files as Express.Multer.File[];
  const fileUrls = files.map((file) => base + file.path);

  console.log("router.post(/file: ", fileUrls);
  res.status(200).send({ urls: fileUrls });
});

export = router;
