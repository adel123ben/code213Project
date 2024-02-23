const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const DIR = "./public/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    // "hello world" => ["hello","world"] "hello-world"
    const filename = file.originalname.toLowerCase().split(" ").join("-");
    const savedFilename = uuidv4() + "-" + filename;
    cb(null, savedFilename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .jpg , .png ,.jpeg extentions are allowed"));
    }
  },
});
module.exports = upload;