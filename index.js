const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'tmp');
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const resize = async (req, res, next) => {
  console.log('req.file', req.file);
  await sharp(req.file.path)
    .resize({
      width: 1200,
      height: 630,
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 80,
      chromaSubsampling: '4:4:4',
      progressive: true,
      optimizeScans: true,
    })
    .toFile(`public/uploads/${req.file.filename.split('.')[0]}.jpg`);
  await fs.unlinkSync(`tmp/${req.file.filename}`);
  return next();
};

const upload = multer({ storage });

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('upload');
});

app.post('/', upload.single('image'), resize, (req, res) => {
  res.redirect(`/showImage?img=${req.file.filename.split('.')[0]}.jpg`);
});

app.get('/showimage', (req, res) => {
  res.render('showImage', {
    image: `/uploads/${req.query.img}`,
    link: `http://localhost:3000/${req.originalUrl}`,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
