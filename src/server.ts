import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import type { WeatherResponse, ForecastResponse } from './types/weather';

// Initialize environment variables
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/weather', async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        console.log('Fetching weather for city:', city);
        const apiUrl = `${process.env.API_BASE_URL}/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.API_KEY}`;
        console.log('API URL:', apiUrl);

        const response: Response = await fetch(apiUrl);
        const data = await response.json() as WeatherResponse;

        console.log('Response status:', response.status);
        console.log('Weather data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            const errorMessage = data.message || 'Unknown error';
            console.error('API Error:', errorMessage);
            return res.status(response.status).json({ 
                error: 'Failed to fetch weather data',
                details: errorMessage 
            });
        }

        // Validate the response data
        if (!data.main || !data.weather || !data.wind) {
            console.error('Invalid API response:', data);
            return res.status(500).json({ 
                error: 'Invalid weather data received',
                details: 'The API response is missing required data'
            });
        }

        res.json(data);
    } catch (error: unknown) {
        console.error('Detailed error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            details: errorMessage 
        });
    }
});

app.get('/api/forecast', async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        console.log('Fetching forecast for city:', city);
        const apiUrl = `${process.env.API_BASE_URL}/data/2.5/forecast?q=${city}&units=imperial&appid=${process.env.API_KEY}`;
        console.log('API URL:', apiUrl);

        const response: Response = await fetch(apiUrl);
        const data = await response.json() as ForecastResponse;

        console.log('Response status:', response.status);
        console.log('Forecast data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            const errorMessage = data.message || 'Unknown error';
            console.error('API Error:', errorMessage);
            return res.status(response.status).json({ 
                error: 'Failed to fetch forecast data',
                details: errorMessage 
            });
        }

        // Validate the response data
        if (!data.list || !Array.isArray(data.list)) {
            console.error('Invalid API response:', data);
            return res.status(500).json({ 
                error: 'Invalid forecast data received',
                details: 'The API response is missing required data'
            });
        }

        res.json(data);
    } catch (error: unknown) {
        console.error('Detailed error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ 
            error: 'Failed to fetch forecast data',
            details: errorMessage 
        });
    }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', `Server is running at http://localhost:${PORT}`);
    console.log(`OpenWeather API Key: ${process.env.API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`API Base URL: ${process.env.API_BASE_URL}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
