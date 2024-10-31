const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "f1fc09a97bebbb56e462ee44b36140fa";

const createWeatherCard = (cityName, weatherItem, index) => {
  const date = weatherItem.dt_txt.split(" ")[0];
  const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
  const windSpeed = weatherItem.wind.speed;
  const humidity = weatherItem.main.humidity;
  const description = weatherItem.weather[0].description;
  const icon = weatherItem.weather[0].icon;

  if (index === 0) {
    return `
      <div class="details">
        <h2>${cityName} (${date})</h2>
        <h6>Temperature: ${tempCelsius}°C</h6>
        <h6>Wind: ${windSpeed} M/S</h6>
        <h6>Humidity: ${humidity}%</h6>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
        <h4>${description}</h4>
      </div>`;
  } else {
    return `
      <li class="card">
        <h3>(${date})</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
        <h6>Temp: ${tempCelsius}°C</h6>
        <h6>Wind: ${windSpeed} M/S</h6>
        <h6>Humidity: ${humidity}%</h6>
      </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(weatherApiUrl)
    .then((response) => response.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(geocodingApiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const reverseGeocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(reverseGeocodingUrl)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location permission to grant access again."
        );
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());
