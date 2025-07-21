const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI (optional - will work in demo mode without API key)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI API initialized successfully');
  } catch (error) {
    console.log('⚠️  OpenAI API failed to initialize:', error.message);
  }
} else {
  console.log('⚠️  OpenAI API key not provided - running in demo mode only');
}

// Middleware
app.use(helmet({
  frameguard: { action: 'sameorigin' }  // Allow iframe for same origin
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from public directory
app.use('/static', express.static(require('path').join(__dirname, '../public'), {
  maxAge: '1h',
  etag: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve sample PDF directly
app.get('/api/sample-pdf', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const samplePdfPath = path.join(__dirname, '../public/sample.pdf');
    
    if (!fs.existsSync(samplePdfPath)) {
      return res.status(404).json({ error: 'Sample PDF not found' });
    }
    
    // Set headers for PDF viewing in iframe
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="sample.pdf"');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    
    // Stream the file for better performance
    const stream = fs.createReadStream(samplePdfPath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving sample PDF:', error);
    res.status(500).json({ error: 'Failed to serve sample PDF' });
  }
});

// Alternative static route for PDF
app.get('/sample.pdf', (req, res) => {
  const path = require('path');
  const samplePdfPath = path.join(__dirname, '../public/sample.pdf');
  res.sendFile(samplePdfPath);
});

// Sample PDF content endpoint
app.get('/api/sample-content', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const samplePdfPath = path.join(__dirname, '../public/sample.pdf');
    
    if (!fs.existsSync(samplePdfPath)) {
      return res.status(404).json({ error: 'Sample PDF not found' });
    }
    
    const pdfBuffer = fs.readFileSync(samplePdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from sample PDF' });
    }
    
    // Structure the content for better display
    const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
    const sections = [];
    let currentSection = { title: '', content: [] };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect section headers (all caps or specific patterns)
      if (trimmedLine.length > 0 && (
        trimmedLine === trimmedLine.toUpperCase() && 
        trimmedLine.length < 100 && 
        !trimmedLine.includes('$') &&
        !trimmedLine.match(/^\d+\./) &&
        !trimmedLine.includes('@')
      )) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { title: trimmedLine, content: [] };
      } else {
        currentSection.content.push(trimmedLine);
      }
    }
    
    // Add the last section
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    res.json({
      rawText: extractedText,
      structuredContent: sections,
      metadata: {
        fileName: 'Sample.pdf',
        totalLines: lines.length,
        sectionsCount: sections.length,
        processedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error reading sample PDF:', error);
    res.status(500).json({ error: 'Failed to process sample PDF' });
  }
});

// PDF upload and analysis endpoint
app.post('/api/analyze-proposal', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Parse PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    // Check if OpenAI is available
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI service configuration error',
        message: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.',
        suggestion: 'Try the demo mode in the frontend for a sample analysis.'
      });
    }

    // Generate AI summary using OpenAI
    const prompt = `
You are an expert business analyst. Analyze the following client proposal and extract information EXACTLY as it appears in the document. Do not make assumptions or add information not present in the text.

Proposal Text:
${extractedText}

INSTRUCTIONS:
1. Executive Summary: Write exactly 3-5 sentences summarizing the proposal
2. Key Requirements: List ALL major requirements and asks from the document
3. Pricing Overview: Extract EXACT pricing information, amounts, and terms as stated
4. Recommended Next Steps: List the exact next steps mentioned in the proposal

Please respond with a valid JSON object in this exact format:
{
  "executiveSummary": "Exactly 3-5 sentences describing what this proposal is about and its main objectives",
  "keyRequirements": [
    "List each key requirement or deliverable exactly as mentioned in the document"
  ],
  "pricingOverview": {
    "totalAmount": "The exact total amount mentioned in the document with currency",
    "breakdown": [
      "List each pricing component with exact amounts as stated in the document"
    ],
    "paymentTerms": "The exact payment terms mentioned in the document"
  },
  "recommendedNextSteps": [
    "List each recommended next step exactly as stated in the document"
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional business analyst. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const analysisText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return res.status(500).json({ error: 'Failed to process AI response' });
    }

    // Add metadata
    const result = {
      ...analysis,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        processedAt: new Date().toISOString(),
        textLength: extractedText.length
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error processing proposal:', error);
    
    if (error.message.includes('API key')) {
      return res.status(500).json({ error: 'AI service configuration error' });
    }
    
    res.status(500).json({ error: 'Failed to process proposal' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
