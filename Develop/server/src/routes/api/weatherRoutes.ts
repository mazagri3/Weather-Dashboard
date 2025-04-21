import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    // Get city name from request body
    const { city } = req.body;
    
    // Validate city name
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: 'City name is required' });
    }
    
    // Get weather data for the city
    const weatherData = await WeatherService.getWeatherForCity(city);
    
    // Save city to search history
    await HistoryService.addCity(city);
    
    // Return weather data
    return res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error in POST /api/weather:', error);
    return res.status(500).json({ error: 'Failed to get weather data' });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    // Get all cities from search history
    const cities = await HistoryService.getCities();
    
    // Return cities array
    return res.status(200).json(cities);
  } catch (error) {
    console.error('Error in GET /api/weather/history:', error);
    return res.status(500).json({ error: 'Failed to get search history' });
  }
});

// * BONUS: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    // Get city ID from request params
    const { id } = req.params;
    
    // Validate ID
    if (!id) {
      return res.status(400).json({ error: 'City ID is required' });
    }
    
    // Remove city from search history
    const success = await HistoryService.removeCity(id);
    
    // Return success/failure response
    if (success) {
      return res.status(200).json({ message: 'City removed from search history' });
    } else {
      return res.status(404).json({ error: 'City not found in search history' });
    }
  } catch (error) {
    console.error('Error in DELETE /api/weather/history/:id:', error);
    return res.status(500).json({ error: 'Failed to remove city from search history' });
  }
});

export default router;
