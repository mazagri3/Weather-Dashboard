import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../db/searchHistory.json');

// Define a City class with name and id properties
// This class represents a city in the search history
class City {
  id: string;
  name: string;

  constructor(name: string, id: string = uuidv4()) {
    this.name = name;
    this.id = id;
  }
}

// Complete the HistoryService class
class HistoryService {
  // Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      // Read the file
      const data = await fs.readFile(dbPath, 'utf8');
      // Parse the JSON and map to City objects
      return JSON.parse(data).map((city: any) => new City(city.name, city.id));
    } catch (error) {
      // If file doesn't exist or is empty, return empty array
      console.error('Error reading search history file:', error);
      return [];
    }
  }

  // Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      // Write the cities array to the file
      await fs.writeFile(dbPath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing to search history file:', error);
      throw error;
    }
  }

  // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string): Promise<City> {
    try {
      // Read existing cities
      const cities = await this.read();
      
      // Check if city already exists (case-insensitive)
      const existingCity = cities.find(c => c.name.toLowerCase() === city.toLowerCase());
      if (existingCity) {
        return existingCity;
      }
      
      // Create new city
      const newCity = new City(city);
      
      // Add to cities array
      cities.push(newCity);
      
      // Write updated array back to file
      await this.write(cities);
      
      return newCity;
    } catch (error) {
      console.error('Error adding city:', error);
      throw error;
    }
  }

  // * BONUS: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<boolean> {
    try {
      // Read existing cities
      const cities = await this.read();
      
      // Filter out the city with the given id
      const filteredCities = cities.filter(city => city.id !== id);
      
      // If no cities were removed, return false
      if (filteredCities.length === cities.length) {
        return false;
      }
      
      // Write the updated array back to the file
      await this.write(filteredCities);
      
      return true;
    } catch (error) {
      console.error('Error removing city:', error);
      throw error;
    }
  }
}

export default new HistoryService();
