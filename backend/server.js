const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const convert = require('srt-convert-json');

const app = express();

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
    console.log('Test endpoint hit');
    res.json({ message: 'Server is running' });
});

// API endpoint for SRT file upload and conversion
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log("Received Call");
    console.log("Request file:", req.file);
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        console.log("Processing file:", req.file.path);
        
        // Log file contents
        const fileContents = fs.readFileSync(req.file.path, 'utf-8');
        console.log("File contents:", fileContents.substring(0, 500) + '...'); // First 500 chars
        // Convert SRT to JSON using temporary files
        const outputPath = req.file.path;
        
        // Wrap the conversion in a Promise with timeout
        await new Promise((resolve, reject) => {
            console.log('Starting conversion process...');
            const timeout = setTimeout(() => {
                reject(new Error('Conversion timed out after 30 seconds'));
            }, 30000);

            try {
                convert.process(req.file.path, outputPath, (err) => {
                    clearTimeout(timeout);
                    if (err) {
                        console.error('Conversion error:', err);
                        reject(err);
                    } else {
                        console.log('Conversion completed successfully');
                        resolve();
                    }
                });
            } catch (err) {
                clearTimeout(timeout);
                console.error('Conversion threw error:', err);
                reject(err);
            }
        });

        // Read the converted JSON after conversion is complete
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
        console.error("Error processing file:", error);
        
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
