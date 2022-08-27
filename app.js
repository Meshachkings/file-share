require('dotenv').config() 

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const File = require('./models/fiLe');
const bcrypt = require('bcrypt')
 

// database connect
mongoose.connect(process.env.DATABASE_URL)

const app = express();
app.set('view engine', 'ejs');
app.listen(process.env.PORT);
app.use(express.urlencoded({ extended: true }))

// file upload
const upload = multer({
    dest: "uploads"
})

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/upload', upload.single('file'), async  (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    }
    const password = req.body.password;
    if(password != null && password != "") {
        fileData.password = await bcrypt.hash(password, 10);
    }
   
    const file = await File.create(fileData);
    
    res.render('index', {
        fileLink: `${req.headers.origin}/file/${file.id}`
    })
})

app.get("/file/:id", handleDownload)
app.post("/file/:id", handleDownload)

async function handleDownload(req, res) {
    const id = req.params.id;

    const file = await File.findById(id);

    if(file.password != null ){
        if(req.body.password == null ){
            res.render('password');
            return;
        }

        if( await bcrypt.compare(req.body.password, file.password)){
            res.render('password', { error: true });
            return;
        }
    }

    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)

    res.download(file.path, file.originalName)
}

