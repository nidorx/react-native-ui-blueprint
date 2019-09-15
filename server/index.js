const fs = require('fs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

if (!fs.existsSync('./public/images/')) {
    fs.mkdirSync('./public/images/');
}

if (!fs.existsSync('./public/images.json')) {
    fs.writeFileSync('./public/images.json', JSON.stringify([]));
}

const imagesJson = require('./public/images.json');

app.post('/upload', multer().single('image'), (req, res) => {
    if (req.file) {
        const ext = path.extname(req.file.originalname);

        const imageName = 'i-' + (+new Date()) + ext;

        let imageInfo = {
            thumb: {
                uri: 'images/' + imageName,
                width: undefined,
                height: undefined
            },
            width: undefined,
            height: undefined,
            uri: 'images/' + imageName,
            title: req.file.originalname.replace(ext, '')
        };

        fs.writeFileSync('./public/images/' + imageName, req.file.buffer);

        imagesJson.push(imageInfo);

        fs.writeFileSync('./public/images.json', JSON.stringify(imagesJson));
    }

    res.redirect('/');
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT);
});
