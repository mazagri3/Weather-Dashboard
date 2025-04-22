// Weather Dashboard JavaScript
// Author: Obi Mazagri
// This file handles the weather data fetching and display functionality

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const historyList = document.getElementById('history');
const todaySection = document.getElementById('today');
const forecastSection = document.getElementById('forecast');
const forecastContainer = document.querySelector('.forecast-container');
const weatherEmoji = document.querySelector('.weather-emoji');

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
        // Show loading state
        document.getElementById('search-title').innerHTML = 'Loading...';
        weatherEmoji.textContent = '⏳';
        forecastContainer.innerHTML = '';

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
        document.getElementById('search-title').innerHTML = 'Error loading weather data';
        weatherEmoji.textContent = '❌';
        forecastContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error.message || 'Failed to fetch weather data. Please try again.'}
            </div>
        `;
    }
}

async function fetchWeatherData(city) {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch weather data');
    }
    
    return data;
}

async function fetchForecastData(city) {
    const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch forecast data');
    }
    
    return data;
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
    forecastContainer.innerHTML = '';
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
        forecastContainer.appendChild(card);
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
        const item = document.createElement('div');
        item.className = 'list-group-item history-item d-flex justify-content-between align-items-center';
        
        const cityButton = document.createElement('button');
        cityButton.className = 'btn btn-link text-start flex-grow-1';
        cityButton.textContent = city;
        cityButton.addEventListener('click', () => {
            searchInput.value = city;
            handleSearch(new Event('submit'));
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';
        deleteButton.setAttribute('aria-label', `Delete ${city} from history`);
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the city button click
            deleteFromHistory(city);
        });

        item.appendChild(cityButton);
        item.appendChild(deleteButton);
        historyList.appendChild(item);
    });
}

function deleteFromHistory(city) {
    searchHistory = searchHistory.filter(item => item !== city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// Initialize
displaySearchHistory(); 