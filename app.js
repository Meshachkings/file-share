require("dotenv").config();
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const File = require("./models/File");

const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads" });

mongoose.connect(process.env.DATABASE_URL);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  return res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req.file);
  try {
    const fileData = {
      path: req.file.path,
      originalName: req.file.originalname,
    };
    if (req.body.password != null && req.body.password !== "") {
      fileData.password = await bcrypt.hash(req.body.password, 10);
    }

    const file = await File.create(fileData);

    return res.render("index", {
      fileLink: `${req.headers.origin}/file/${file.id}`,
    });
  } catch (err) {
    return res.status(400).send(err.message ?? "An error occured");
  }
});

app.route("/file/:id").get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  try {
    if (!req.params.id) throw new Error("No id passed");
    const file = await File.findById(req.params.id);

    if (!file) throw new Error("File does not exist");

    if (!file.password && req.body.password == null) {
      file.downloadCount++;
      await file.save();
      return res.download(file.path, file.originalName);
    }
    if(file.password){
      if(req.body.password == null){
        res.render('password');
      }
    }

    // check if password is valid
    if (!(await bcrypt.compare(req.body.password, file.password))) {
      return res.render("password", { error: true });
      
        // const isValid = await bcrypt.compare(
        // req.body.password,
        // file.password

    }

    file.downloadCount++;
    await file.save();
    return res.download(file.path, file.originalName);
  } catch (err) {
    return res.status(400).send(err.message ?? "An error occured");
  }
}

app.listen(process.env.PORT);
