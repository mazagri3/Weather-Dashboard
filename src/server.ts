import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Initialize environment variables
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import routes from './routes/index.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/weather', async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        const response = await fetch(
            `${process.env.API_BASE_URL}/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/api/forecast', async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        const response = await fetch(
            `${process.env.API_BASE_URL}/data/2.5/forecast?q=${city}&units=imperial&appid=${process.env.API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
});

// Connect routes
app.use(routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`OpenWeather API Key: ${process.env.API_KEY ? 'Configured' : 'Not configured'}`);
});
