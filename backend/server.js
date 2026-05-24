/**
 * Proxy entre frontend y los modelos para mantener las api keys en servidor.
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
// Soporte para múltiples orígenes separados por coma
const CORS_ORIGIN = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : 'http://localhost:5173';

const getApiKey = (name, serviceName) => {
    const apiKey = process.env[name];

    if (!apiKey) {
        return { error: `${serviceName} no está configurado en el servidor` };
    }

    return { apiKey };
};

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// GROQ
app.post('/groq', async (req, res) => {
    try {
        const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.7 } = req.body;
        const config = getApiKey('GROQ_API_KEY', 'Groq');

        if (config.error) {
            return res.status(500).json({ error: { message: config.error } });
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model,
                messages,
                temperature
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                }
            }
        );

        return res.json(response.data);
    } catch (error) {
        //console.error('Groq error:', error);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || { message: 'Error en Groq' }
        });
    }
});

// GEMINI
app.post('/gemini', async (req, res) => {
    try {
        const { messages, model = 'gemini-flash-latest' } = req.body;
        const config = getApiKey('GEMINI_API_KEY', 'Gemini');

        if (config.error) {
            return res.status(500).json({ error: { message: config.error } });
        }

        // Convertir formato OpenAI a Gemini
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
            { contents },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return res.json(response.data);
    } catch (error) {
        //console.error('Gemini error:', error);
        return res.status(error.response?.status || 500).json({
            error: { message: 'Error en Gemini' }
        });
    }
});

// OPENROUTER (desuso)
/*app.post('/api/openrouter', async (req, res) => {
    try {
        const { messages, model = 'openai/gpt-4', temperature = 0.7 } = req.body;
        const config = getApiKey('OPENROUTER_API_KEY', 'OpenRouter');

        if (config.error) {
            return res.status(500).json({ error: { message: config.error } });
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model,
                messages,
                temperature
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                    'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:5173',
                    'X-Title': 'IAGen-TFG'
                }
            }
        );

        return res.json(response.data);
    } catch (error) {
        console.error('OpenRouter error full:', error);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || { message: 'Error en OpenRouter' },
            debug: {
                route: '/api/openrouter',
                method: req.method,
                body: req.body
            }
        });
    }
});
*/

// 404 handler for unmatched /api/* routes and others
app.use((req, res) => {
    console.warn(`No route matched: ${req.method} ${req.originalUrl}`);
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: { message: 'API route not found' }, route: req.originalUrl });
    }
    return res.status(404).send('Not Found');
});

// OLLAMA - Deprecado porque el modelo deepseek pasó a ser de pago
/*app.post('/api/ollama', async (req, res) => {
    try {
        const { messages, model = 'deepseek-v3.1:671b-cloud', temperature = 0.7 } = req.body;

        const response = await axios.post(
            'http://localhost:11434/v1/chat/completions',
            {
                model,
                messages,
                temperature
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return res.json(response.data);
    } catch (error) {
        console.error('Ollama error:', error.message);
        return res.status(error.response?.status || 500).json({
            error: { message: 'Error: Ollama no disponible en localhost:11434' }
        });
    }
});
*/

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend SofIA corriendo en el puerto ${PORT}`);
    console.log(`\nEndpoints (internos):`);
    console.log(`   - Groq:       POST http://localhost:${PORT}/groq`);
    console.log(`   - Gemini:     POST http://localhost:${PORT}/gemini`);
    console.log(`\nEl servidor redirige /api/* a este puerto automáticamente`);
});
