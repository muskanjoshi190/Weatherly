# Weatherly — Live Weather Dashboard

A modern, responsive weather dashboard that provides real-time weather information and a five-day forecast for cities around the world.

Built using HTML, CSS and JavaScript, Weatherly uses the Open-Meteo API to retrieve live weather data and dynamically display current conditions in a clean, dark-themed interface.

## Overview

Weatherly makes it easy to check current weather conditions and plan ahead with a simple and interactive dashboard. Users can search for cities, explore weather forecasts and switch between Celsius and Fahrenheit.

## Features

- **Live Weather Updates:** Fetches current weather conditions using the Open-Meteo API.
- **City Search:** Search for cities around the world.
- **Five-Day Forecast:** Displays daily maximum and minimum temperatures.
- **Temperature Conversion:** Switch between Celsius and Fahrenheit.
- **Weather Conditions:** Displays weather descriptions and corresponding icons.
- **City Suggestions:** Provides debounced search suggestions.
- **Current Location:** Fetch weather using browser geolocation.
- **Recent Search:** Remembers the last searched city using localStorage.
- **Error Handling:** Displays clear messages for invalid input, unavailable cities and network issues.
- **Responsive Design:** Optimized for desktop, tablet and mobile devices.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling, animations and responsive layout |
| JavaScript | Application logic and dynamic rendering |
| Fetch API | Communication with weather services |
| Async/Await | Asynchronous API operations |
| Open-Meteo API | Weather and geocoding data |
| localStorage | Remembering the last searched city |

## API Integration

Weatherly uses the following public APIs:

**1. Geocoding API**

Converts a city name into geographical coordinates.

https://geocoding-api.open-meteo.com/v1/search

**2. Forecast API**

Retrieves current weather conditions and daily forecast information using latitude and longitude.

https://api.open-meteo.com/v1/forecast

No API key is required.

## Error Handling

The application includes structured error handling to provide a smooth user experience.

- Validates empty and short search inputs.
- Checks HTTP response status before processing JSON.
- Handles network connection failures.
- Displays a friendly message when a city cannot be found.
- Handles unsuccessful or unreadable API responses.
- Displays loading feedback while fetching weather information.
- Disables the search button during active requests.

User-provided text is rendered safely using `textContent`.

## Project Structure

```text
Weatherly-Project-04/
│
├── index.html
├── style.css
├── script.js
├── README.md
└── SUBMISSION-NOTES.txt
```

## Run Locally

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if it is not already available.
3. Open `index.html`.
4. Select **Open with Live Server**.
5. Search for any city to view its weather information.

An active internet connection is required to retrieve live weather data.

## Future Improvements

- Hourly weather forecasts.
- Weather alerts and notifications.
- Additional weather statistics.
- Improved location-based recommendations.

## Data Source

Weather information is provided by [Open-Meteo](https://open-meteo.com/).

## Author

**Muskan Joshi**

B.Tech Computer Science Engineering

GitHub: [muskanjoshi190](https://github.com/muskanjoshi190)

---

*Weatherly — A simple way to stay ahead of the weather.*
