const API_KEY = '487b23c2a6227c8c7ee5e2dc87a2a494'; // <-- Replace with your OpenWeatherMap API key
let units = localStorage.getItem('units') || 'metric';

const qs = id => document.getElementById(id);
function showError(msg) {
    const el = qs('errorMsg');
    if (!msg) return (el.classList.add('hidden'), el.textContent = '');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
}

async function fetchWeather(query) {
    showError();
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=${units}`
        );
        if (!res.ok) throw new Error('City not found');
        const data = await res.json();
        updateUI(data);
        localStorage.setItem('lastCity', query);
        qs('lastCity').textContent = query;
    } catch (e) {
        showError(e.message);
    }
}

function updateUI(d) {
    qs('temp').textContent = `${Math.round(d.main.temp)}°${units === 'metric' ? 'C' : 'F'}`;
    qs('feels').textContent = `${Math.round(d.main.feels_like)}°`;
    qs('hum').textContent = `${d.main.humidity}%`;
    qs('wind').textContent = `${Math.round(d.wind.speed)} ${units === 'metric' ? 'm/s' : 'mph'}`;
    qs('press').textContent = `${d.main.pressure} hPa`;
    qs('place').textContent = `${d.name}, ${d.sys.country}`;
    qs('cond').textContent = d.weather[0].main;
    qs('timeLocal').textContent = new Date(d.dt * 1000).toLocaleString();
}

qs('searchBtn').addEventListener('click', () => {
    const city = qs('cityInput').value.trim();
    if (city) fetchWeather(city);
});

qs('geoBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return showError('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${units}`
            );
            const data = await res.json();
            updateUI(data);
            localStorage.setItem('lastCity', data.name);
            qs('lastCity').textContent = data.name;
        } catch {
            showError('Unable to fetch location weather');
        }
    });
});

qs('cBtn').addEventListener('click', () => {
    units = 'metric'; localStorage.setItem('units', 'metric');
    const last = localStorage.getItem('lastCity');
    if (last) fetchWeather(last);
});
qs('fBtn').addEventListener('click', () => {
    units = 'imperial'; localStorage.setItem('units', 'imperial');
    const last = localStorage.getItem('lastCity');
    if (last) fetchWeather(last);
});

// Load last searched city
window.addEventListener('load', () => {
    const last = localStorage.getItem('lastCity');
    if (last) {
        qs('lastCity').textContent = last;
        fetchWeather(last);
    }
});
