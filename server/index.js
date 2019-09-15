const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const upload = multer({dest: __dirname + '/public/images'});

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {

        let row = {
            thumb: {
                name: '',
                width: 0,
                height: 0
            },
            width: 0,
            height: 0,
            name: req.file.filename,
            title: req.file.originalname
        };

        sharp(req.file.path)
            .metadata()
            .then(function (metadata) {
                row.width = metadata.width;
                row.height = metadata.height;

                // renaming
                row.thumb.name = row.name + '-thumb.' + metadata.format
                row.name = row.name + '.' + metadata.format;

                let newPath = req.file.path + '.' + metadata.format;
                fs.renameSync(req.file.path, newPath);

                // thumbnail
                return sharp(newPath)
                    .resize(300)
                    .toFile(req.file.path + '-thumb.' + metadata.format)
                    .then(info => {
                        row.thumb.width = info.width;
                        row.thumb.height = info.height;
                    });
            })
            .then(() => {
                var images = require('./public/images.json');
                images.push(row);
                fs.writeFileSync('./public/images.json', JSON.stringify(images));
                res.redirect('/');
            })
            .catch(err => {
                res.error(err);
            });


    } else {
        throw 'error';
    }
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT);
});
