# Weatherly — Project 04

A responsive live weather dashboard built with HTML, CSS and vanilla JavaScript.

## Features
- Search for a city using the Open-Meteo Geocoding API.
- Live current conditions and a five-day forecast.
- Celsius / Fahrenheit toggle.
- Weather descriptions and icons mapped from Open-Meteo weather codes.
- Loading, empty-input, city-not-found and network error states.
- Debounced city suggestions (450 ms) to avoid unnecessary API calls.
- Optional browser geolocation.
- Remembers the last searched city with `localStorage`.
- Responsive layout for desktop, tablet and mobile.
- Uses `textContent` for user/API text rendered into the page.

## Run locally
1. Extract the ZIP.
2. Open the `Weatherly-Project-04` folder in VS Code.
3. Start the page using **Live Server** (recommended), or run a local static server.
4. Search for a city such as `Indore`, `Mumbai` or `London`.

The app uses public Open-Meteo endpoints and does not require an API key. An internet connection is required for live data. Browser location access requires permission and generally a secure context (localhost or HTTPS).

## APIs
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

## Error handling
Each request checks `response.ok` before parsing JSON. Network failures, unsuccessful HTTP responses, invalid JSON and empty geocoding results are handled with readable messages. The search form validates blank and very short input. The submit button is disabled while a forecast is loading.

## Project files
- `index.html` — page structure and accessible controls.
- `style.css` — responsive visual design.
- `script.js` — API requests, state handling, rendering and interactions.

## Before submitting
- Run the project with Live Server and test at least three cities.
- Test the °C / °F switch.
- Test an invalid city and an empty search.
- Test mobile layout using browser DevTools.
- If you publish it, enable GitHub Pages for the repository and submit both the live URL and repository URL as requested in the learner guide.

Weather data by [Open-Meteo](https://open-meteo.com/).
