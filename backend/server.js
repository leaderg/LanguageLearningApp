const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const srtToJson = require('srt-convert-json');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// API endpoint for SRT file upload and conversion
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Read the uploaded SRT file
        const srtContent = fs.readFileSync(req.file.path, 'utf-8');
        
        // Convert SRT to JSON
        const subtitles = await srtToJson(srtContent);
        
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({
            message: 'File processed successfully',
            filename: req.file.originalname,
            subtitles: subtitles
        });
    } catch (error) {
        // Clean up the uploaded file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            error: 'Failed to process SRT file',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
