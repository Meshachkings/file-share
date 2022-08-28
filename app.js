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

// renders the upload page
app.get("/", (req, res) => {
  res.render("index");
});

// handles uploading a file
app.post("/upload", upload.single("file"), async (req, res) => {
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

/*
  fetch a file by its id and display it

  if it has a password, show the password input.
  
  if it dosen't have a password, just show a
  button to click to download the file
*/
app.get("/file/:id", async (req, res) => {
  try {
    if (!req.params.id) throw new Error("No id passed");
    const file = await File.findById(req.params.id);

    if (!file) throw new Error("File does not exist");

    // if the file has a password, show the password field
    return res.render("file", { password: !!file.password });
  } catch (err) {
    return res.status(400).send(err.message ?? "An error occured");
  }
});

/*
 download a file

 if the file has a password, confirm the password the user entered
 and download the file if it is correct. if it isn't correct,
 show the password page with an error


 if the file dosen't have a password, download the file
 */
app.post("/download/:id", async (req, res) => {
  try {
    if (!req.params.id) throw new Error("No id passed");
    const file = await File.findById(req.params.id);

    if (!file) throw new Error("File does not exist");

    if (!file.password) {
      file.downloadCount++;
      await file.save();
      return res.download(file.path, file.originalName);
    }

    if (file.password) {
      const isValid = await bcrypt.compare(
        req.body.password,
        file.password.toString()
      );
      if (!isValid) return res.render("password", { error: true });
      file.downloadCount++;
      await file.save();
      return res.download(file.path, file.originalName);
    }
  } catch (err) {
    return res.status(400).send(err.message ?? "An error occured");
  }
});

// app.post("/file/:id", handleDownload);

// async function handleDownload(req, res) {
//   try {
//     if (!req.params.id) throw new Error("No id passed");
//     const file = await File.findById(req.params.id);

//     if (!file) throw new Error("File does not exist");

//     if (!file.password) {
//       file.downloadCount++;
//       await file.save();
//       return res.download(file.path, file.originalName);
//     }

//     if (file.password) {
//       const isValid = await bcrypt.compare(
//         req.body.password,
//         file.password.toString()
//       );
//       if (!isValid) return res.render("password", { error: true });
//       file.downloadCount++;
//       await file.save();
//       return res.download(file.path, file.originalName);
//     }
//   } catch (err) {
//     return res.status(400).send(err.message ?? "An error occured");
//   }
// }

app.listen(process.env.PORT, () =>
  console.log(`server running on localhost:${process.env.PORT}/`)
);
