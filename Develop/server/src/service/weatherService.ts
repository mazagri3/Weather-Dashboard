import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

// Define an interface for the Coordinates object
// This interface represents the latitude and longitude for a location
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
// This class represents the weather data for a specific location and time
class Weather {
  date: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;

  constructor(date: string, temp: number, humidity: number, windSpeed: number, description: string, icon: string) {
    this.date = date;
    this.temp = temp;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.description = description;
    this.icon = icon;
  }
}

// Complete the WeatherService class
class WeatherService {
  // Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string = '';

  constructor() {
    // Initialize properties from environment variables
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || '';
  }

  // Create fetchLocationData method to get coordinates for a city
  private async fetchLocationData(query: string) {
    try {
      const geocodeQuery = this.buildGeocodeQuery(query);
      console.log(`Attempting to fetch location data for: ${query}`);
      console.log(`Using URL: ${geocodeQuery}`);
      
      const response = await fetch(geocodeQuery);
      
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Error response: ${errorData}`);
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      console.log('Location data response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  }

  // Create destructureLocationData method to extract coordinates
  private destructureLocationData(locationData: any): Coordinates {
    // Check if using OpenWeather API or fallback
    if (Array.isArray(locationData)) {
      // OpenWeather API response
      if (!locationData || !locationData[0]) {
        throw new Error('No location data found');
      }
      
      const { lat, lon } = locationData[0];
      return { lat, lon };
    } else {
      // Fallback API response (open-meteo)
      if (!locationData || !locationData.results || !locationData.results[0]) {
        throw new Error('No location data found');
      }
      
      const { latitude, longitude } = locationData.results[0];
      return { lat: latitude, lon: longitude };
    }
  }

  // Create buildGeocodeQuery method to construct the geocoding API URL
  private buildGeocodeQuery(city: string): string {
    // Use fallback API for now until OpenWeather API key is activated (can take up to 2 hours)
    // To use OpenWeather API later, just set useOpenWeather to true
    const useOpenWeather = false;
    
    if (useOpenWeather && this.apiKey && this.apiKey !== 'your_openweather_api_key_here') {
      console.log(`Using OpenWeather API: ${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`);
      return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
    } else {
      // Fallback to free API for testing
      console.log(`Using fallback API for testing since OpenWeather API key may not be activated yet`);
      return `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    }
  }

  // Create buildWeatherQuery method to construct the weather API URL
  private buildWeatherQuery(coordinates: Coordinates): string {
    // Use fallback API for now until OpenWeather API key is activated (can take up to 2 hours)
    // To use OpenWeather API later, just set useOpenWeather to true
    const useOpenWeather = false;
    
    if (useOpenWeather && this.apiKey && this.apiKey !== 'your_openweather_api_key_here') {
      return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    } else {
      // Fallback to free API for testing
      return `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=5`;
    }
  }

  // Create fetchAndDestructureLocationData method to get coordinates from city name
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    this.cityName = city;
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method to get weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates);
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return await response.json() as any;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Build parseCurrentWeather method to create Weather object from API response
  private parseCurrentWeather(response: any): Weather {
    // Check if we're using OpenWeather API or the fallback
    if (response.list) {
      // OpenWeather API response
      const currentWeatherData = response.list[0];
      const date = new Date(currentWeatherData.dt * 1000).toLocaleDateString();
      const temp = currentWeatherData.main.temp;
      const humidity = currentWeatherData.main.humidity;
      const windSpeed = currentWeatherData.wind.speed;
      const description = currentWeatherData.weather[0].description;
      const icon = currentWeatherData.weather[0].icon;
  
      return new Weather(date, temp, humidity, windSpeed, description, icon);
    } else {
      // Fallback API response (open-meteo)
      const today = new Date().toLocaleDateString();
      const temp = response.daily.temperature_2m_max[0];
      const humidity = 0; // Not available in free API
      const windSpeed = response.daily.windspeed_10m_max[0];
      const description = "Weather forecast";
      const icon = "01d"; // Default icon
  
      return new Weather(today, temp, humidity, windSpeed, description, icon);
    }
  }

  // Complete buildForecastArray method to create array of Weather objects
  private buildForecastArray(currentWeather: Weather, weatherData: any): Weather[] {
    // Check if we have an array (OpenWeather) or an object with daily data (Open-Meteo)
    if (Array.isArray(weatherData)) {
      // OpenWeather API response
      // Start with current weather
      const forecast = [currentWeather];
      
      // Get one forecast per day (every 8th entry, roughly 24 hours)
      // Skip the first entry (current day)
      for (let i = 8; i < weatherData.length; i += 8) {
        const data = weatherData[i];
        // Skip if undefined (might happen near the end of the array)
        if (!data) continue;
        
        const date = new Date(data.dt * 1000).toLocaleDateString();
        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
  
        forecast.push(new Weather(date, temp, humidity, windSpeed, description, icon));
        
        // Stop after we have 5 days total (including current day)
        if (forecast.length >= 5) break;
      }
      
      return forecast;
    } else {
      // Open-Meteo API response
      // Already have current day as the first item
      const forecast = [currentWeather];
      
      // Add the next 4 days (indices 1-4 in the daily arrays)
      for (let i = 1; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const dailyData = weatherData.daily;
        const temp = dailyData.temperature_2m_max[i];
        const humidity = 0; // Not available in free API
        const windSpeed = dailyData.windspeed_10m_max[i];
        const description = "Forecast";
        const icon = "01d"; // Default icon
        
        forecast.push(new Weather(date.toLocaleDateString(), temp, humidity, windSpeed, description, icon));
      }
      
      return forecast;
    }
  }

  // Complete getWeatherForCity method to get full weather data for a city
  async getWeatherForCity(city: string) {
    try {
      console.log(`Getting weather for city: ${city}`);
      if (!city || city.trim() === '') {
        throw new Error('City name cannot be empty');
      }
      
      // Get coordinates for the city
      console.log(`Fetching coordinates for: ${city}`);
      const coordinates = await this.fetchAndDestructureLocationData(city);
      console.log(`Coordinates obtained: lat=${coordinates.lat}, lon=${coordinates.lon}`);
      
      // Get weather data using the coordinates
      console.log(`Fetching weather data for coordinates`);
      const weatherResponse = await this.fetchWeatherData(coordinates);
      
      // Parse current weather
      console.log(`Parsing current weather`);
      const currentWeather = this.parseCurrentWeather(weatherResponse);
      
      // Build forecast array
      console.log(`Building forecast array`);
      const forecastData = weatherResponse.list || weatherResponse.daily;
      const forecast = this.buildForecastArray(currentWeather, forecastData);
      
      // Return complete weather data
      console.log(`Weather data successfully retrieved for ${this.cityName}`);
      return {
        city: this.cityName,
        current: currentWeather,
        forecast: forecast
      };
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}

export default new WeatherService();
