const API_KEY = "67f599b3f98e62380bf14b3d131a32c9";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Grab elements from the page
const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const message = document.getElementById("message");

const cityEl = document.getElementById("city");
const dateEl = document.getElementById("date");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const forecastList = document.getElementById("forecast-list");

form.addEventListener("submit", function(event) {
    event.preventDefault(); // stops form reloading

    const city = input.value;

    if (city == "") {
        alert("Please enter city name");
        return;
    }

    getWeather(city);
});

async function getWeather(city) {
    hideMessage();

    try {
        const q = encodeURIComponent(city);

        const currentURL = `${BASE_URL}/weather?q=${q}&units=metric&appid=${API_KEY}`;
        const forecastURL = `${BASE_URL}/forecast?q=${q}&units=metric&appid=${API_KEY}`;

        const currRes = await fetch(currentURL);

        if (!currRes.ok) {
            if (currRes.status == 404) {
                throw new Error("City not found");
            }

            if (currRes.status == 401) {
                throw new Error("API key is wrong");
            }
        }

        const currData = await currRes.json();
        console.log(currData);

        const forecastRes = await fetch(forecastURL);
        const forecastData = await forecastRes.json();

        console.log(forecastData);

        showCurrent(currData);
        showForecast(forecastData);

    } catch (error) {
        showMessage(error.message);
    }
}

function showCurrent(data) {
    cityEl.textContent = `${data.name}, ${data.sys.country}`;

    dateEl.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    tempEl.textContent = `${Math.round(data.main.temp)}°`;
    conditionEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
    humidityEl.textContent = `${data.main.humidity}%`;

    // API gives wind in m/s, multiply by 3.6 to get km/h
    windEl.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;

    const iconCode = data.weather[0].icon;

    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconEl.alt = data.weather[0].description;
}

function showForecast(data) {
    const today = new Date().toDateString();

    const days = data.list.filter(function(item) {
        const isNoon = item.dt_txt.includes("12:00:00");
        const isToday = new Date(item.dt * 1000).toDateString() == today;

        return isNoon && isToday;
    });

    forecastList.innerHTML = "";

    days.slice(0, 5).forEach(function(item) {
        const li = document.createElement("li");
        li.className = "forecast-day";

        const dayName = new Date(item.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short"
        });

        const icon = item.weather[0].icon;

        li.innerHTML = `
            <span class="forecast-name">${dayName}</span>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="${item.weather[0].description}">
            <span class="forecast-temp">${Math.round(item.main.temp)}°</span>
        `;

        forecastList.appendChild(li);
    });
}

function showMessage(text) {
    message.textContent = text;
    message.classList.remove("hidden");
}

function hideMessage() {
    message.classList.add("hidden");
}

// ---------- 7. Load a default city on start ----------
getWeather("Delhi");