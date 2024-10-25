const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const convert = require('srt-convert-json');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
    origin: 'null',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// API endpoint for SRT file upload and conversion
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Convert SRT to JSON using temporary files
        const outputPath = req.file.path + '.json';
        await convert.process(req.file.path, outputPath);
        
        // Read the converted JSON
        const jsonContent = fs.readFileSync(outputPath, 'utf-8');
        const subtitles = JSON.parse(jsonContent);
        
        // Log the JSON to console
        console.log('Processed JSON output:');
        console.log(JSON.stringify(subtitles, null, 2));
        
        // Clean up temporary files
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputPath);
        
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
