(() => {
  "use strict";

  const API = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    forecast: "https://api.open-meteo.com/v1/forecast"
  };

  const state = { unit: "c", lastWeather: null, toastTimer: null, searchTimer: null };
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    form: $("#searchForm"), input: $("#cityInput"), searchButton: $("#searchButton"),
    status: $("#statusMessage"), results: $("#results"), empty: $("#emptyState"),
    place: $("#placeName"), country: $("#countryName"), date: $("#currentDate"),
    temp: $("#currentTemp"), icon: $("#currentIcon"), condition: $("#currentCondition"),
    feels: $("#feelsLike"), high: $("#todayHigh"), low: $("#todayLow"),
    rangeHigh: $("#rangeHigh"), rangeLow: $("#rangeLow"), rangeFill: $("#rangeFill"),
    wind: $("#windValue"), humidity: $("#humidityValue"), daylight: $("#daylightValue"),
    updated: $("#updatedAt"), forecast: $("#forecastGrid"), unitToggle: $("#unitToggle"),
    locationButton: $("#locationButton"), suggestions: $("#suggestions"), toast: $("#toast")
  };

  const WEATHER_CODES = {
    0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"], 45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Dense drizzle", "🌧️"],
    56: ["Freezing drizzle", "🌧️"], 57: ["Heavy freezing drizzle", "🌧️"],
    61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
    66: ["Freezing rain", "🌧️"], 67: ["Heavy freezing rain", "🌧️"],
    71: ["Light snow", "🌨️"], 73: ["Snow", "❄️"], 75: ["Heavy snow", "❄️"],
    77: ["Snow grains", "🌨️"], 80: ["Rain showers", "🌦️"], 81: ["Showers", "🌧️"],
    82: ["Heavy showers", "⛈️"], 85: ["Snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"],
    95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Heavy thunderstorm", "⛈️"]
  };

  function weatherInfo(code) {
    return WEATHER_CODES[code] || ["Conditions unavailable", "🌡️"];
  }

  function setStatus(message, type = "") {
    elements.status.textContent = message;
    elements.status.className = `status-message ${type}`.trim();
  }

  function setLoading(isLoading) {
    elements.searchButton.disabled = isLoading;
    elements.searchButton.querySelector("span:first-child").textContent = isLoading ? "Loading…" : "Search";
    elements.input.disabled = isLoading;
    elements.locationButton.disabled = isLoading;
    document.body.classList.toggle("loading", isLoading);
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2800);
  }

  function toDisplayTemp(value) {
    if (!Number.isFinite(value)) return "--";
    const converted = state.unit === "f" ? (value * 9 / 5) + 32 : value;
    return `${Math.round(converted)}°`;
  }

  function formatDate(dateString, options = { weekday: "short", day: "numeric" }) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, options);
  }

  async function requestJson(url, failureMessage) {
    let response;
    try {
      response = await fetch(url);
    } catch {
      throw new Error("Network problem. Check your connection and try again.");
    }
    if (!response.ok) throw new Error(failureMessage);
    try {
      return await response.json();
    } catch {
      throw new Error("The weather service returned an unreadable response.");
    }
  }

  async function findCity(name) {
    const url = new URL(API.geocoding);
    url.search = new URLSearchParams({ name, count: "5", language: "en", format: "json" }).toString();
    const data = await requestJson(url, "The city search service is not responding.");
    if (!data.results || data.results.length === 0) throw new Error(`We couldn't find “${name}”. Check the spelling or try a nearby city.`);
    return data.results;
  }

  async function getWeather(latitude, longitude) {
    const url = new URL(API.forecast);
    url.search = new URLSearchParams({
      latitude: String(latitude), longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
      forecast_days: "5", timezone: "auto"
    }).toString();
    return requestJson(url, "We couldn't load this forecast right now. Please try again.");
  }

  function daylightDuration(sunrise, sunset) {
    if (!sunrise || !sunset) return "—";
    const minutes = Math.max(0, Math.round((new Date(sunset) - new Date(sunrise)) / 60000));
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  function renderForecast(daily) {
    elements.forecast.replaceChildren();
    daily.time.forEach((date, index) => {
      const [description, icon] = weatherInfo(daily.weather_code[index]);
      const card = document.createElement("article");
      card.className = "forecast-card";
      const day = document.createElement("div"); day.className = "forecast-day";
      day.textContent = index === 0 ? "Today" : formatDate(date);
      const symbol = document.createElement("div"); symbol.className = "forecast-icon"; symbol.textContent = icon;
      const condition = document.createElement("div"); condition.className = "forecast-condition"; condition.textContent = description;
      const temps = document.createElement("div"); temps.className = "forecast-temps";
      const max = document.createElement("strong"); max.textContent = toDisplayTemp(daily.temperature_2m_max[index]);
      const min = document.createElement("span"); min.textContent = toDisplayTemp(daily.temperature_2m_min[index]);
      temps.append(max, min); card.append(day, symbol, condition, temps); elements.forecast.append(card);
    });
  }

  function renderWeather(city, weather) {
    const current = weather.current;
    const daily = weather.daily;
    const [description, icon] = weatherInfo(current.weather_code);
    elements.place.textContent = city.name;
    elements.country.textContent = [city.admin1, city.country].filter(Boolean).join(", ");
    elements.date.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    elements.temp.textContent = "";
    const temperatureNumber = document.createTextNode(toDisplayTemp(current.temperature_2m).replace("°", ""));
    const degree = document.createElement("span"); degree.textContent = "°";
    elements.temp.append(temperatureNumber, degree);
    elements.icon.textContent = icon;
    elements.condition.textContent = description;
    elements.feels.textContent = `Feels like ${toDisplayTemp(current.apparent_temperature)} · ${current.is_day ? "Daytime" : "Night-time"} conditions`;
    elements.high.textContent = toDisplayTemp(daily.temperature_2m_max[0]);
    elements.low.textContent = toDisplayTemp(daily.temperature_2m_min[0]);
    elements.rangeHigh.textContent = toDisplayTemp(daily.temperature_2m_max[0]);
    elements.rangeLow.textContent = toDisplayTemp(daily.temperature_2m_min[0]);
    const spread = Math.max(1, daily.temperature_2m_max[0] - daily.temperature_2m_min[0]);
    elements.rangeFill.style.width = `${Math.min(100, Math.max(18, 45 + spread * 2))}%`;
    elements.wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.daylight.textContent = daylightDuration(daily.sunrise[0], daily.sunset[0]);
    elements.updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    renderForecast(daily);
    elements.empty.hidden = true;
    elements.results.hidden = false;
    state.lastWeather = { city, weather };
    setStatus(`Showing live conditions for ${city.name}.`, "success");
    document.title = `${city.name} Weather — Weatherly`;
  }

  async function searchCity(name) {
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      setStatus("Please enter a city name before searching.", "error");
      elements.input.focus();
      return;
    }
    if (cleanName.length < 2) {
      setStatus("Enter at least 2 characters to search.", "error");
      elements.input.focus();
      return;
    }
    setLoading(true);
    setStatus("Finding your city and checking the forecast…");
    elements.suggestions.hidden = true;
    try {
      const matches = await findCity(cleanName);
      const city = matches[0];
      const weather = await getWeather(city.latitude, city.longitude);
      renderWeather(city, weather);
      localStorage.setItem("weatherly-last-city", city.name);
    } catch (error) {
      setStatus(error.message || "Something went wrong. Please try again.", "error");
      if (error.message.startsWith("We couldn't find")) showToast("No matching city found");
    } finally {
      setLoading(false);
    }
  }

  function renderUnit() {
    document.querySelectorAll(".unit-option").forEach(option => {
      option.classList.toggle("active", option.dataset.unit === state.unit);
    });
    if (state.lastWeather) renderWeather(state.lastWeather.city, state.lastWeather.weather);
  }

  async function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("Location isn't supported by this browser. Search for a city instead.", "error");
      return;
    }
    setLoading(true);
    setStatus("Waiting for your location permission…");
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        setStatus("Loading weather for your location…");
        const { latitude, longitude } = position.coords;
        const weather = await getWeather(latitude, longitude);
        const city = { name: "Your location", country: "Current position" };
        renderWeather(city, weather);
        localStorage.removeItem("weatherly-last-city");
      } catch (error) {
        setStatus(error.message, "error");
      } finally { setLoading(false); }
    }, error => {
      const messages = {
        1: "Location permission was denied. You can search for a city instead.",
        2: "Your location couldn't be determined. Please try again.",
        3: "Location request timed out. Please try again."
      };
      setStatus(messages[error.code] || "Unable to get your location.", "error");
      setLoading(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  elements.form.addEventListener("submit", event => {
    event.preventDefault();
    searchCity(elements.input.value);
  });

  elements.input.addEventListener("input", () => {
    clearTimeout(state.searchTimer);
    const value = elements.input.value.trim();
    if (value.length < 2) { elements.suggestions.hidden = true; return; }
    // Debounced suggestions avoid sending a request on every keystroke.
    state.searchTimer = setTimeout(async () => {
      try {
        const matches = await findCity(value);
        elements.suggestions.replaceChildren();
        matches.slice(0, 4).forEach(city => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = [city.name, city.admin1, city.country].filter(Boolean).join(", ");
          button.addEventListener("click", () => {
            elements.input.value = city.name;
            elements.suggestions.hidden = true;
            searchCity(city.name);
          });
          elements.suggestions.append(button);
        });
        elements.suggestions.hidden = false;
      } catch {
        elements.suggestions.hidden = true;
      }
    }, 450);
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".search-wrap")) elements.suggestions.hidden = true;
  });

  document.querySelectorAll("[data-city]").forEach(button => {
    button.addEventListener("click", () => {
      elements.input.value = button.dataset.city;
      searchCity(button.dataset.city);
    });
  });

  elements.unitToggle.addEventListener("click", () => {
    state.unit = state.unit === "c" ? "f" : "c";
    renderUnit();
  });
  elements.locationButton.addEventListener("click", useCurrentLocation);

  // Restore the last searched city without forcing a request if the page is opened offline.
  const savedCity = localStorage.getItem("weatherly-last-city");
  if (savedCity) {
    elements.input.value = savedCity;
    searchCity(savedCity);
  }
})();
