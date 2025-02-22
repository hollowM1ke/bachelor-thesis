if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const morgan = require('morgan')
const express = require('express');
const rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
const FileType = require('file-type');
const { v4 } = require('uuid');
const validateToken = require('./auth-middleware/tokenValidation');
const checkPermission = require('./auth-middleware/hasPermission');
const app = express();
const PORT = parseInt(process.env.PORT);
const INTERNAL_URI=process.env.INTERNAL_URI;
const SAVE_TO = process.env.SAVE_TO;                                // storage directory
const ALLOWED_TYPES = process.env.ALLOWED_FILE_TYPES.split(',');    // Allowed mime types
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);          // Max file size in MBs
const RATE_WINDOW = parseInt(process.env.RATE_WINDOW);              // The rate limiting window in minutes
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT);                // The number of requests in that window

app.use(rateLimit({
    windowMs: RATE_WINDOW * 60 * 1000,
    max: RATE_LIMIT
}));
app.use(fileUpload({
    limits: { fileSize: MAX_FILE_SIZE * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true
}));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}


app.post('/imageapi/media', validateToken, checkPermission('media', 'update'), async function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const imageFile = req.files.image;
    const calculatedMimeType = await FileType.fromBuffer(imageFile.data); // Note: won't work if using temp files
    if (!calculatedMimeType || !ALLOWED_TYPES.includes(calculatedMimeType.mime)) {
        return res.status(415).send('File type not allowed');
    }

    const fileId = getFileId(imageFile);
    const fileLocation = SAVE_TO + '/' + fileId;
    console.info(`Saving file to ${fileLocation}`);

    imageFile.mv(fileLocation, function (err) {
        if (err) { return res.status(500).send(err); }

        res.status(200).send({
            id: fileId
        });
    });
});

app.get('/imageapi/media/:id', validateToken, checkPermission('media', 'read'), function (req, res) {
    const id = req.params.id;
    res.set('X-Accel-Redirect', `/file/${id}`);
    res.status(200).send()
});

app.listen(PORT, () => {
    console.info(`Image storage backend started on port ${PORT}`);
});

function getFileId (file) {
    return v4();
}
