const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    password: String,
    downloadCount: {
        type: Number,
        required: true,
        default: 0
    }
})

const file = mongoose.model("File", fileSchema);

module.exports = file;