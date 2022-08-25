require('dotenv').config(); 
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

// database connect
mongoose.connect(process.env.DATABASE_URL)

const app = express();
app.set('view engine', 'ejs');
app.listen(process.env.PORT);

// file upload
const upload = multer({
    dest: "uploads"
})

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/upload', upload.single('file'), (req, res) => {
    res.send('hi');
})