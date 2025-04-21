import dotenv from 'dotenv';
dotenv.config();

interface WeatherData {
    city: string;
    temperature: number;
    description: string;
    timestamp: string;
}

class WeatherService {
    private static readonly API_KEY = process.env.OPENWEATHER_API_KEY;
    private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

    static async getWeather(city: string): Promise<WeatherData> {
        console.log('API Key:', this.API_KEY); // Temporary debug log
        
        if (!this.API_KEY) {
            throw new Error('OpenWeather API key not found');
        }

        const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}&units=imperial&appid=${this.API_KEY}`;
        console.log('Fetching weather data from:', url);

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Weather API response:', data);
            
            return {
                city: data.name,
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error in getWeather:', error);
            throw error;
        }
    }
}

export default WeatherService;
