import { Router, type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { city } = req.body;
    if (!city) {
      res.status(400).json({ error: 'City name is required' });
      return;
    }

    console.log('Received request for city:', city);
    const weatherData = await WeatherService.getWeather(city);
    console.log('Weather data:', weatherData);
    
    await HistoryService.saveCity(city);
    console.log('City saved to history');
    
    res.json(weatherData);
  } catch (error) {
    console.error('Error in weather route:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch weather data',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response): Promise<void> => {
  try {
    const history = await HistoryService.getHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch search history',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'City ID is required' });
      return;
    }

    await HistoryService.deleteCity(Number(id));
    res.json({ message: `City with ID ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete city from history',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

export default router;
