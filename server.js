// ===== LINGUAVIET SERVER - RAG CHATBOT WITH GEMINI API =====

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/Ảnh', express.static(path.join(__dirname, 'Ảnh')));

// ===== API CONFIGURATION =====
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Validate API key
if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

// ===== LOGGING MIDDLEWARE =====
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'LinguaViet server is running',
        timestamp: new Date().toISOString(),
        model: GEMINI_MODEL,
        apiKeyConfigured: !!GEMINI_API_KEY
    });
});

// ===== TEST ENDPOINT =====
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'LinguaViet API is ready!',
        model: GEMINI_MODEL,
        apiKeyConfigured: !!GEMINI_API_KEY,
        environment: process.env.NODE_ENV || 'development',
        features: {
            rag: true,
            translation: true,
            chatbot: true
        }
    });
});

// ===== MAIN CHAT ENDPOINT (RAG + GEMINI) =====
app.post('/api/chat', async (req, res) => {
    try {
        const { message, context, history } = req.body;
        
        // Validation
        if (!message) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }
        
        console.log('💬 Chat request received');
        console.log('📝 Message length:', message.length);
        console.log('📚 Context provided:', !!context);
        console.log('🕐 History messages:', history?.length || 0);
        
        // Prepare request for Gemini API
        const requestBody = {
            contents: [{
                parts: [{
                    text: message
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        // Make request to Gemini API
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        };
        
        console.log('🚀 Sending request to Gemini API...');
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Gemini API error:', data);
            
            // Handle specific error cases
            if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                    details: 'Rate limit exceeded'
                });
            }
            
            if (response.status === 401 || response.status === 403) {
                return res.status(401).json({ 
                    error: 'Lỗi xác thực API key',
                    details: 'API key invalid or unauthorized'
                });
            }
            
            return res.status(response.status).json({ 
                error: 'Lỗi từ Gemini API',
                details: data.error?.message || 'Unknown error'
            });
        }
        
        console.log('✅ Response received from Gemini API');
        
        // Log response structure
        if (data.candidates && data.candidates[0]) {
            const responseText = data.candidates[0].content?.parts?.[0]?.text;
            console.log('📤 Response length:', responseText?.length || 0);
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ===== TRANSLATION ENDPOINT (Optional - for future) =====
app.post('/api/translate', async (req, res) => {
    try {
        const { text, direction } = req.body;
        
        if (!text || !direction) {
            return res.status(400).json({ 
                error: 'Text and direction are required' 
            });
        }
        
        // TODO: Implement actual translation model
        // For now, return mock response
        
        res.json({
            original: text,
            translated: `[Translated: ${text}]`,
            direction: direction,
            model: 'mock'
        });
        
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ 
            error: 'Translation failed',
            details: error.message 
        });
    }
});

// ===== SERVE INDEX.HTML =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path 
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('\n✨ ========================================');
    console.log('🚀 LinguaViet Server Started!');
    console.log('========================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Host: ${HOST}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Model: ${GEMINI_MODEL}`);
    console.log(`🔑 API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log('========================================\n');
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});