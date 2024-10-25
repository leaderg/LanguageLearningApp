const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const app = express();

function parseSRT(content) {
    const subtitles = [];
    const blocks = content.trim().split('\n\n');
    
    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length >= 3) {
            // Skip the index number and timestamp, just get the text
            const text = lines.slice(2).join(' ').trim();
            subtitles.push({
                text: text
            });
        }
    }
    
    return subtitles;
}

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const upload = multer({ 
    dest: uploadDir,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
    }
});

// Add more detailed CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 600
}));

// Increase payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.json());

// Add a basic test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// API endpoint for SRT file upload and conversion
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const fileContents = fs.readFileSync(req.file.path, 'utf-8');
        const subtitles = parseSRT(fileContents);
        
        // Clean up temporary files
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
            details: error.message,
            stack: error.stack
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
