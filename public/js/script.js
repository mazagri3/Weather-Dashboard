// Weather Dashboard JavaScript
// Author: Obi Mazagri
// This file handles the weather data fetching and display functionality

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const historyList = document.getElementById('history');
const todaySection = document.getElementById('today');
const forecastSection = document.getElementById('forecast');

// State
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Event Listeners
searchForm.addEventListener('submit', handleSearch);

// Functions
async function handleSearch(event) {
    event.preventDefault();
    const city = searchInput.value.trim();
    if (!city) return;

    try {
        // Fetch current weather
        const currentWeatherData = await fetchWeatherData(city);
        displayCurrentWeather(currentWeatherData);

        // Fetch 5-day forecast
        const forecastData = await fetchForecastData(city);
        displayForecast(forecastData);

        // Update search history
        updateSearchHistory(city);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}

async function fetchWeatherData(city) {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
}

async function fetchForecastData(city) {
    const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Failed to fetch forecast data');
    return await response.json();
}

function displayCurrentWeather(data) {
    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    
    document.getElementById('search-title').innerHTML = `
        ${data.name} (${formattedDate})
        <img id="weather-img" class="weather-img" src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    `;
    document.getElementById('temp').textContent = `Temperature: ${Math.round(data.main.temp)}°F`;
    document.getElementById('wind').textContent = `Wind: ${data.wind.speed} MPH`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
}

function displayForecast(data) {
    forecastSection.innerHTML = '';
    // Get every 8th item (24-hour intervals) for 5-day forecast
    const dailyForecasts = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h5>${formattedDate}</h5>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
            <p>Temp: ${Math.round(day.main.temp)}°F</p>
            <p>Wind: ${day.wind.speed} MPH</p>
            <p>Humidity: ${day.main.humidity}%</p>
        `;
        forecastSection.appendChild(card);
    });
}

function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

function displaySearchHistory() {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const item = document.createElement('button');
        item.className = 'list-group-item history-item';
        item.textContent = city;
        item.addEventListener('click', () => {
            searchInput.value = city;
            handleSearch(new Event('submit'));
        });
        historyList.appendChild(item);
    });
}

// Initialize
displaySearchHistory(); 