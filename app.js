const express = require('express');
const multer = require('multer');


const app = express();
app.set('view engine', 'ejs');
app.listen(3000);

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