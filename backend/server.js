const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const artworks = [];

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/uploads', express.static(uploadsDir));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, '..', 'frontend', 'index.html')
    );
});

app.get('/api/artworks', (req, res) => {
    res.json({ artworks });
});

app.post('/api/artworks', upload.single('artwork'), (req, res) => {
    try {
        const {
            name,
            email,
            title,
            category,
            price,
            description
        } = req.body;

        // Validate required fields
        if (!name || !email || !title || !price || !description) {
            return res.status(400).json({
                message: 'Missing required fields.'
            });
        }

        const numericPrice = Number(price);

        if (isNaN(numericPrice)) {
            return res.status(400).json({
                message: 'Price must be a number.'
            });
        }

        const saved = {
            id: artworks.length + 1,
            name: name,
            email: email,
            title: title,
            category: category || null,
            price: numericPrice,
            description: description,
            filename: req.file ? req.file.filename : null,
            originalname: req.file ? req.file.originalname : null,
            uploadedAt: new Date().toISOString()
        };

        artworks.push(saved);

        console.log('Artwork submitted:', saved);

        return res.json({
            message: 'Artwork submitted successfully.',
            artwork: saved
        });

    } catch (err) {
        console.error('Error handling submission:', err);

        return res.status(500).json({
            message: 'Internal server error.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});