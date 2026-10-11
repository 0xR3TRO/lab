// SkyPulse — Advanced Weather Dashboard
// Original concept by 0xR3TR0. Modernized 2026.

(() => {
    "use strict";

    // ===== CONFIG =====
    // Weather and air-quality data: Open-Meteo (https://open-meteo.com) — free, no API key,
    // licensed CC BY 4.0. The adapter in fetchAllData() converts Open-Meteo responses into
    // the shapes the rendering code below expects.
    const ENDPOINTS = {
        geo: (city) =>
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
        forecast: (lat, lon, units) => {
            const imperial = units === "imperial";
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                timezone: "auto",
                forecast_days: "6",
                current:
                    "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility",
                hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,is_day",
                daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
                temperature_unit: imperial ? "fahrenheit" : "celsius",
                wind_speed_unit: imperial ? "mph" : "ms",
            });
            return `https://api.open-meteo.com/v1/forecast?${params}`;
        },
        air: (lat, lon) =>
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`,
    };

    // WMO weather codes → [main group, description, icon code]
    const WMO = {
        0: ["Clear", "clear sky", "01"],
        1: ["Clouds", "mainly clear", "02"],
        2: ["Clouds", "partly cloudy", "03"],
        3: ["Clouds", "overcast", "04"],
        45: ["Fog", "fog", "50"],
        48: ["Fog", "depositing rime fog", "50"],
        51: ["Drizzle", "light drizzle", "09"],
        53: ["Drizzle", "drizzle", "09"],
        55: ["Drizzle", "dense drizzle", "09"],
        56: ["Drizzle", "freezing drizzle", "09"],
        57: ["Drizzle", "dense freezing drizzle", "09"],
        61: ["Rain", "light rain", "10"],
        63: ["Rain", "rain", "10"],
        65: ["Rain", "heavy rain", "10"],
        66: ["Rain", "freezing rain", "10"],
        67: ["Rain", "heavy freezing rain", "10"],
        71: ["Snow", "light snow", "13"],
        73: ["Snow", "snow", "13"],
        75: ["Snow", "heavy snow", "13"],
        77: ["Snow", "snow grains", "13"],
        80: ["Rain", "light rain showers", "09"],
        81: ["Rain", "rain showers", "09"],
        82: ["Rain", "violent rain showers", "09"],
        85: ["Snow", "snow showers", "13"],
        86: ["Snow", "heavy snow showers", "13"],
        95: ["Thunderstorm", "thunderstorm", "11"],
        96: ["Thunderstorm", "thunderstorm with hail", "11"],
        99: ["Thunderstorm", "thunderstorm with heavy hail", "11"],
    };
    const wmo = (code, isDay) => {
        const [main, description, icon] = WMO[code] || ["Clouds", "cloudy", "03"];
        return [{ main, description, icon: icon + (isDay ? "d" : "n") }];
    };
    const round1 = (v) => Math.round((v ?? 0) * 10) / 10;
    // "2026-10-11T14:00" in the location's local time → Unix seconds
    const localToUnix = (iso, offset) => Date.parse(`${iso.length === 16 ? `${iso}:00` : iso}Z`) / 1000 - offset;

    // ===== STATE =====
    let state = {
        units: localStorage.getItem("sp_units") || "metric",
        theme: localStorage.getItem("sp_theme") || "dark",
        history: JSON.parse(localStorage.getItem("sp_history") || "[]"),
        hourlyData: [],
        chartType: "temp",
        hourlyChart: null,
        tempRangeChart: null,
    };

    // ===== DOM REFS =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        searchInput: $("#searchInput"),
        searchHistory: $("#searchHistory"),
        geoBtn: $("#geoBtn"),
        unitToggle: $("#unitToggle"),
        themeToggle: $("#themeToggle"),
        errorBanner: $("#errorBanner"),
        errorMsg: $("#errorMsg"),
        errorClose: $("#errorClose"),
        loader: $("#loader"),
        weatherContent: $("#weatherContent"),
        // Current
        currentDate: $("#currentDate"),
        currentCity: $("#currentCity"),
        currentCountry: $("#currentCountry"),
        currentTemp: $("#currentTemp"),
        currentIcon: $("#currentIcon"),
        currentDesc: $("#currentDesc"),
        feelsLike: $("#feelsLike"),
        tempMax: $("#tempMax"),
        tempMin: $("#tempMin"),
        // Details
        humidity: $("#humidity"),
        windSpeed: $("#windSpeed"),
        windDir: $("#windDir"),
        pressure: $("#pressure"),
        visibility: $("#visibility"),
        dewPoint: $("#dewPoint"),
        cloudiness: $("#cloudiness"),
        windGust: $("#windGust"),
        // Sun
        sunrise: $("#sunrise"),
        sunset: $("#sunset"),
        dayLength: $("#dayLength"),
        localTime: $("#localTime"),
        // AQI
        aqiCircle: $("#aqiCircle"),
        aqiValue: $("#aqiValue"),
        aqiLabel: $("#aqiLabel"),
        // Hourly
        hourlyScroll: $("#hourlyScroll"),
        // Forecast
        forecastList: $("#forecastList"),
        // Comfort
        comfortAnalysis: $("#comfortAnalysis"),
        // Charts
        hourlyChart: $("#hourlyChart"),
        tempRangeChart: $("#tempRangeChart"),
    };

    // ===== UTILITY FUNCTIONS =====
    const unitSymbol = () => (state.units === "metric" ? "°C" : "°F");
    const speedUnit = () => (state.units === "metric" ? "m/s" : "mph");

    function formatTime(unix, tz) {
        const date = new Date((unix + tz) * 1000);
        return date.toUTCString().slice(17, 22);
    }

    function formatDate(unix, tz) {
        const date = new Date((unix + tz) * 1000);
        const options = { weekday: "long", month: "short", day: "numeric" };
        // Build a date in UTC that represents local time
        const localDate = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
        );
        return localDate.toLocaleDateString("en-US", options);
    }

    function formatDayName(unix) {
        const date = new Date(unix * 1000);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    function formatHour(dtTxt) {
        const d = new Date(dtTxt);
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    function degToCompass(deg) {
        const dirs = [
            "N",
            "NNE",
            "NE",
            "ENE",
            "E",
            "ESE",
            "SE",
            "SSE",
            "S",
            "SSW",
            "SW",
            "WSW",
            "W",
            "WNW",
            "NW",
            "NNW",
        ];
        return dirs[Math.round(deg / 22.5) % 16];
    }

    function calcDewPoint(temp, humidity) {
        // Magnus formula approximation
        const a = 17.27,
            b = 237.7;
        const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
        return Math.round((b * alpha) / (a - alpha));
    }

    function getWeatherIconClass(code, isDay = true) {
        const iconMap = {
            "01d": "fa-solid fa-sun",
            "01n": "fa-solid fa-moon",
            "02d": "fa-solid fa-cloud-sun",
            "02n": "fa-solid fa-cloud-moon",
            "03d": "fa-solid fa-cloud",
            "03n": "fa-solid fa-cloud",
            "04d": "fa-solid fa-cloud",
            "04n": "fa-solid fa-cloud",
            "09d": "fa-solid fa-cloud-showers-heavy",
            "09n": "fa-solid fa-cloud-showers-heavy",
            "10d": "fa-solid fa-cloud-sun-rain",
            "10n": "fa-solid fa-cloud-moon-rain",
            "11d": "fa-solid fa-cloud-bolt",
            "11n": "fa-solid fa-cloud-bolt",
            "13d": "fa-solid fa-snowflake",
            "13n": "fa-solid fa-snowflake",
            "50d": "fa-solid fa-smog",
            "50n": "fa-solid fa-smog",
        };
        return iconMap[code] || "fa-solid fa-cloud";
    }

    function getAqiInfo(aqi) {
        const levels = [
            { label: "Good", color: "var(--aqi-good)" },
            { label: "Fair", color: "var(--aqi-fair)" },
            { label: "Moderate", color: "var(--aqi-moderate)" },
            { label: "Poor", color: "var(--aqi-poor)" },
            { label: "Very Poor", color: "var(--aqi-very-poor)" },
        ];
        return levels[aqi - 1] || levels[0];
    }

    // ===== API CALLS =====
    async function fetchJSON(url) {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    }

    async function geocodeCity(city) {
        const data = await fetchJSON(ENDPOINTS.geo(city));
        if (!data.results || !data.results.length) throw new Error("City not found");
        const r = data.results[0];
        return {
            lat: r.latitude,
            lon: r.longitude,
            name: r.name,
            country: r.country_code || "",
        };
    }

    async function fetchAllData(lat, lon, place = {}) {
        const [fc, aq] = await Promise.all([
            fetchJSON(ENDPOINTS.forecast(lat, lon, state.units)),
            fetchJSON(ENDPOINTS.air(lat, lon)).catch(() => null),
        ]);
        const tz = fc.utc_offset_seconds;
        const c = fc.current;
        const weather = {
            dt: localToUnix(c.time, tz),
            timezone: tz,
            name: place.name || "My location",
            sys: {
                country: place.country || "",
                sunrise: localToUnix(fc.daily.sunrise[0], tz),
                sunset: localToUnix(fc.daily.sunset[0], tz),
            },
            main: {
                temp: c.temperature_2m,
                feels_like: c.apparent_temperature,
                temp_min: fc.daily.temperature_2m_min[0],
                temp_max: fc.daily.temperature_2m_max[0],
                humidity: c.relative_humidity_2m,
                pressure: Math.round(c.pressure_msl),
            },
            weather: wmo(c.weather_code, c.is_day),
            wind: {
                speed: round1(c.wind_speed_10m),
                deg: Math.round(c.wind_direction_10m ?? 0),
                gust: round1(c.wind_gusts_10m),
            },
            visibility: c.visibility,
            clouds: { all: c.cloud_cover },
        };

        // 3-hour steps from the current hour (40 steps = 5 days), the layout the UI was built for
        const h = fc.hourly;
        const start = Math.max(0, h.time.findIndex((iso) => localToUnix(iso, tz) >= weather.dt - 3600));
        const list = [];
        for (let i = start; i < h.time.length && list.length < 40; i += 3) {
            list.push({
                dt: localToUnix(h.time[i], tz),
                dt_txt: `${h.time[i].replace("T", " ")}:00`,
                main: { temp: h.temperature_2m[i], humidity: h.relative_humidity_2m[i] },
                wind: { speed: round1(h.wind_speed_10m[i]) },
                weather: wmo(h.weather_code[i], h.is_day[i]),
                pop: (h.precipitation_probability[i] ?? 0) / 100,
            });
        }

        // European AQI (0–100+) → 5 levels: Good, Fair, Moderate, Poor, Very Poor
        const a = (aq && aq.current) || {};
        const air = {
            list: [
                {
                    main: { aqi: Math.min(5, Math.floor((a.european_aqi ?? 0) / 20) + 1) },
                    components: {
                        pm2_5: a.pm2_5 ?? 0,
                        pm10: a.pm10 ?? 0,
                        o3: a.ozone ?? 0,
                        no2: a.nitrogen_dioxide ?? 0,
                        so2: a.sulphur_dioxide ?? 0,
                        co: a.carbon_monoxide ?? 0,
                    },
                },
            ],
        };
        return { weather, forecast: { list }, air };
    }

    // ===== SEARCH HISTORY =====
    function saveToHistory(city) {
        const name = city.trim();
        if (!name) return;
        state.history = state.history.filter(
            (c) => c.toLowerCase() !== name.toLowerCase(),
        );
        state.history.unshift(name);
        if (state.history.length > 8) state.history.pop();
        localStorage.setItem("sp_history", JSON.stringify(state.history));
    }

    function renderSearchHistory() {
        if (!state.history.length) {
            dom.searchHistory.classList.remove("show");
            return;
        }
        dom.searchHistory.innerHTML = state.history
            .map(
                (c) =>
                    `<div class="search-history__item" data-city="${c}">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>${c}</span>
                    </div>`,
            )
            .join("");
        dom.searchHistory.classList.add("show");
    }

    // ===== UI SHOW/HIDE =====
    function showLoader() {
        dom.loader.classList.remove("hidden");
        dom.weatherContent.classList.add("hidden");
        dom.errorBanner.classList.add("hidden");
    }

    function hideLoader() {
        dom.loader.classList.add("hidden");
    }

    function showError(msg) {
        hideLoader();
        dom.errorMsg.textContent = msg;
        dom.errorBanner.classList.remove("hidden");
        dom.weatherContent.classList.add("hidden");
    }

    function showWeather() {
        hideLoader();
        dom.errorBanner.classList.add("hidden");
        dom.weatherContent.classList.remove("hidden");
    }

    // ===== RENDER: CURRENT WEATHER =====
    function renderCurrent(data) {
        const tz = data.timezone;
        dom.currentDate.textContent = formatDate(data.dt, tz);
        dom.currentCity.textContent = data.name;
        dom.currentCountry.textContent = data.sys.country || "";
        dom.currentTemp.textContent = `${Math.round(data.main.temp)}${unitSymbol()}`;
        dom.currentDesc.textContent = data.weather[0].description;
        dom.feelsLike.textContent = `${Math.round(data.main.feels_like)}${unitSymbol()}`;
        dom.tempMax.textContent = `${Math.round(data.main.temp_max)}${unitSymbol()}`;
        dom.tempMin.textContent = `${Math.round(data.main.temp_min)}${unitSymbol()}`;

        // Icon
        const iconCode = data.weather[0].icon;
        dom.currentIcon.className = `weather-icon-large ${getWeatherIconClass(iconCode)}`;

        // Details
        dom.humidity.textContent = `${data.main.humidity}%`;
        dom.windSpeed.textContent = `${data.wind.speed} ${speedUnit()}`;
        dom.windDir.textContent = `${degToCompass(data.wind.deg)} (${data.wind.deg}°)`;
        dom.pressure.textContent = `${data.main.pressure} hPa`;
        dom.visibility.textContent = data.visibility
            ? `${(data.visibility / 1000).toFixed(1)} km`
            : "N/A";
        dom.dewPoint.textContent = `${calcDewPoint(data.main.temp, data.main.humidity)}${unitSymbol()}`;
        dom.cloudiness.textContent = `${data.clouds.all}%`;
        dom.windGust.textContent = data.wind.gust
            ? `${data.wind.gust} ${speedUnit()}`
            : "N/A";

        // Sun
        dom.sunrise.textContent = formatTime(data.sys.sunrise, tz);
        dom.sunset.textContent = formatTime(data.sys.sunset, tz);

        const dayLenSec = data.sys.sunset - data.sys.sunrise;
        const dayH = Math.floor(dayLenSec / 3600);
        const dayM = Math.floor((dayLenSec % 3600) / 60);
        dom.dayLength.textContent = `${dayH}h ${dayM}m`;

        // Local time — update every second
        updateLocalTime(tz);
    }

    let localTimeInterval;
    function updateLocalTime(tz) {
        clearInterval(localTimeInterval);
        const update = () => {
            const now = new Date();
            const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
            const local = new Date(utcMs + tz * 1000);
            dom.localTime.textContent = local.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
        };
        update();
        localTimeInterval = setInterval(update, 1000);
    }

    // ===== RENDER: AIR QUALITY =====
    function renderAirQuality(data) {
        const aqi = data.list[0].main.aqi;
        const comp = data.list[0].components;
        const info = getAqiInfo(aqi);

        dom.aqiValue.textContent = aqi;
        dom.aqiLabel.textContent = info.label;
        dom.aqiCircle.style.borderColor = info.color;
        dom.aqiValue.style.color = info.color;

        // Pollutant bars (normalized to reasonable max values)
        const pollutants = [
            { id: "pm25", key: "pm2_5", max: 75 },
            { id: "pm10", key: "pm10", max: 150 },
            { id: "o3", key: "o3", max: 240 },
            { id: "no2", key: "no2", max: 200 },
            { id: "so2", key: "so2", max: 350 },
            { id: "co", key: "co", max: 15000 },
        ];

        pollutants.forEach((p) => {
            const val = comp[p.key] || 0;
            const pct = Math.min((val / p.max) * 100, 100);
            const bar = $(`#${p.id}Bar`);
            const valEl = $(`#${p.id}Val`);
            if (bar) bar.style.width = `${pct}%`;
            if (valEl) valEl.textContent = `${val.toFixed(1)} µg/m³`;
        });
    }

    // ===== RENDER: HOURLY =====
    function renderHourly(forecastData) {
        const items = forecastData.list.slice(0, 8);
        state.hourlyData = forecastData.list.slice(0, 8);

        dom.hourlyScroll.innerHTML = items
            .map((item, i) => {
                const icon = getWeatherIconClass(item.weather[0].icon);
                const time = i === 0 ? "Now" : formatHour(item.dt_txt);
                const pop = item.pop ? `${Math.round(item.pop * 100)}%` : "";
                return `
                <div class="hourly-item ${i === 0 ? "now" : ""}">
                    <span class="hourly-time">${time}</span>
                    <i class="${icon} hourly-icon"></i>
                    <span class="hourly-temp">${Math.round(item.main.temp)}°</span>
                    ${pop ? `<span class="hourly-pop"><i class="fa-solid fa-droplet"></i> ${pop}</span>` : ""}
                </div>`;
            })
            .join("");
    }

    // ===== RENDER: 5-DAY FORECAST =====
    function renderForecast(forecastData) {
        // Group by day
        const dailyMap = {};
        forecastData.list.forEach((item) => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyMap[date]) dailyMap[date] = [];
            dailyMap[date].push(item);
        });

        const days = Object.keys(dailyMap).slice(0, 5);
        let globalMin = Infinity,
            globalMax = -Infinity;

        const dailyData = days.map((date) => {
            const items = dailyMap[date];
            const temps = items.map((i) => i.main.temp);
            const min = Math.min(...temps);
            const max = Math.max(...temps);
            if (min < globalMin) globalMin = min;
            if (max > globalMax) globalMax = max;

            // Most frequent weather condition
            const conditions = {};
            items.forEach((i) => {
                const key = i.weather[0].icon;
                conditions[key] = (conditions[key] || 0) + 1;
            });
            const mainIcon = Object.entries(conditions).sort(
                (a, b) => b[1] - a[1],
            )[0][0];
            const mainDesc = items.find((i) => i.weather[0].icon === mainIcon)
                .weather[0].description;

            return {
                date,
                min,
                max,
                icon: mainIcon,
                desc: mainDesc,
                dt: items[0].dt,
            };
        });

        const range = globalMax - globalMin || 1;

        dom.forecastList.innerHTML = dailyData
            .map((d) => {
                const leftPct = ((d.min - globalMin) / range) * 100;
                const widthPct = ((d.max - d.min) / range) * 100;
                const icon = getWeatherIconClass(d.icon);
                return `
                <div class="forecast-item">
                    <span class="forecast-day">${formatDayName(d.dt)}</span>
                    <i class="${icon} forecast-icon"></i>
                    <div class="forecast-bar-wrap">
                        <div class="forecast-bar" style="left:${leftPct}%;width:${Math.max(widthPct, 4)}%"></div>
                    </div>
                    <div class="forecast-temps">
                        <span class="hi">${Math.round(d.max)}°</span>
                        <span class="lo">${Math.round(d.min)}°</span>
                    </div>
                    <span class="forecast-desc">${d.desc}</span>
                </div>`;
            })
            .join("");

        return dailyData;
    }

    // ===== RENDER: CHARTS =====
    function getChartConfig() {
        const textColor =
            getComputedStyle(document.documentElement)
                .getPropertyValue("--text-muted")
                .trim() || "#6a6a8a";
        const gridColor =
            getComputedStyle(document.documentElement)
                .getPropertyValue("--border")
                .trim() || "rgba(255,255,255,0.06)";
        return { textColor, gridColor };
    }

    function renderHourlyChart() {
        const items = state.hourlyData;
        if (!items.length) return;

        const { textColor, gridColor } = getChartConfig();
        const labels = items.map((item, i) =>
            i === 0 ? "Now" : formatHour(item.dt_txt),
        );

        let data, label, borderColor, bgColor, yConfig;

        switch (state.chartType) {
            case "humidity":
                data = items.map((i) => i.main.humidity);
                label = "Humidity (%)";
                borderColor = "#3a7bd5";
                bgColor = "rgba(58, 123, 213, 0.15)";
                yConfig = {
                    min: 0,
                    max: 100,
                    ticks: { callback: (v) => v + "%" },
                };
                break;
            case "wind":
                data = items.map((i) => i.wind.speed);
                label = `Wind (${speedUnit()})`;
                borderColor = "#00d2ff";
                bgColor = "rgba(0, 210, 255, 0.15)";
                yConfig = {};
                break;
            case "pop":
                data = items.map((i) => Math.round((i.pop || 0) * 100));
                label = "Rain Chance (%)";
                borderColor = "#5b9bd5";
                bgColor = "rgba(91, 155, 213, 0.15)";
                yConfig = {
                    min: 0,
                    max: 100,
                    ticks: { callback: (v) => v + "%" },
                };
                break;
            default: // temp
                data = items.map((i) => Math.round(i.main.temp));
                label = `Temperature (${unitSymbol()})`;
                borderColor = "#6c63ff";
                bgColor = "rgba(108, 99, 255, 0.15)";
                yConfig = {};
        }

        if (state.hourlyChart) state.hourlyChart.destroy();

        state.hourlyChart = new Chart(dom.hourlyChart, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label,
                        data,
                        borderColor,
                        backgroundColor: bgColor,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: borderColor,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "rgba(15, 15, 26, 0.9)",
                        titleColor: "#f0f0f5",
                        bodyColor: "#a0a0c0",
                        cornerRadius: 8,
                        padding: 10,
                    },
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 11 } },
                        grid: { color: gridColor },
                    },
                    y: {
                        ...yConfig,
                        ticks: {
                            color: textColor,
                            font: { size: 11 },
                            ...yConfig.ticks,
                        },
                        grid: { color: gridColor },
                    },
                },
            },
        });
    }

    function renderTempRangeChart(dailyData) {
        if (!dailyData || !dailyData.length) return;

        const { textColor, gridColor } = getChartConfig();
        const labels = dailyData.map((d) => formatDayName(d.dt));
        const mins = dailyData.map((d) => Math.round(d.min));
        const maxs = dailyData.map((d) => Math.round(d.max));

        if (state.tempRangeChart) state.tempRangeChart.destroy();

        state.tempRangeChart = new Chart(dom.tempRangeChart, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: `Max (${unitSymbol()})`,
                        data: maxs,
                        backgroundColor: "rgba(233, 69, 96, 0.6)",
                        borderColor: "#e94560",
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: `Min (${unitSymbol()})`,
                        data: mins,
                        backgroundColor: "rgba(58, 123, 213, 0.6)",
                        borderColor: "#3a7bd5",
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { size: 12 },
                            usePointStyle: true,
                            pointStyle: "circle",
                        },
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 15, 26, 0.9)",
                        titleColor: "#f0f0f5",
                        bodyColor: "#a0a0c0",
                        cornerRadius: 8,
                        padding: 10,
                    },
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 11 } },
                        grid: { color: gridColor },
                    },
                    y: {
                        ticks: { color: textColor, font: { size: 11 } },
                        grid: { color: gridColor },
                    },
                },
            },
        });
    }

    // ===== RENDER: COMFORT & ACTIVITY ANALYSIS =====
    function renderComfort(weather, forecast) {
        const temp = weather.main.temp;
        const humidity = weather.main.humidity;
        const wind = weather.wind.speed;
        const uv = 5; // Default UV estimate (no UV in free tier)
        const pressure = weather.main.pressure;

        // Heat Index / Wind Chill
        let feelsDesc, feelsClass;
        const feelsLike = weather.main.feels_like;
        if (feelsLike > 35) {
            feelsDesc = "Dangerous Heat";
            feelsClass = "bad";
        } else if (feelsLike > 28) {
            feelsDesc = "Uncomfortable";
            feelsClass = "poor";
        } else if (feelsLike > 18) {
            feelsDesc = "Comfortable";
            feelsClass = "good";
        } else if (feelsLike > 5) {
            feelsDesc = "Cool";
            feelsClass = "moderate";
        } else {
            feelsDesc = "Very Cold";
            feelsClass = "bad";
        }

        // Running / Jogging
        let runDesc, runClass;
        if (temp > 10 && temp < 25 && wind < 8 && humidity < 80) {
            runDesc = "Excellent";
            runClass = "good";
        } else if (temp > 5 && temp < 30 && wind < 12) {
            runDesc = "Good";
            runClass = "moderate";
        } else {
            runDesc = "Poor";
            runClass = "poor";
        }

        // Outdoor activity
        let outdoorDesc, outdoorClass;
        const mainW = weather.weather[0].main;
        if (["Rain", "Thunderstorm", "Snow"].includes(mainW)) {
            outdoorDesc = "Not Recommended";
            outdoorClass = "bad";
        } else if (temp > 15 && temp < 30 && humidity < 75) {
            outdoorDesc = "Great";
            outdoorClass = "good";
        } else {
            outdoorDesc = "Fair";
            outdoorClass = "moderate";
        }

        // Driving conditions
        let driveDesc, driveClass;
        const vis = weather.visibility || 10000;
        if (vis < 1000 || mainW === "Thunderstorm") {
            driveDesc = "Hazardous";
            driveClass = "bad";
        } else if (vis < 5000 || mainW === "Rain" || mainW === "Snow") {
            driveDesc = "Caution";
            driveClass = "poor";
        } else {
            driveDesc = "Good";
            driveClass = "good";
        }

        // Pressure trend
        let pressureDesc, pressureClass;
        if (pressure > 1020) {
            pressureDesc = "High (Stable)";
            pressureClass = "good";
        } else if (pressure > 1000) {
            pressureDesc = "Normal";
            pressureClass = "moderate";
        } else {
            pressureDesc = "Low (Storms)";
            pressureClass = "poor";
        }

        // Allergy risk based on humidity + wind
        let allergyDesc, allergyClass;
        if (humidity > 70 || mainW === "Rain") {
            allergyDesc = "Low";
            allergyClass = "good";
        } else if (wind > 6 && humidity < 50) {
            allergyDesc = "High";
            allergyClass = "poor";
        } else {
            allergyDesc = "Moderate";
            allergyClass = "moderate";
        }

        const items = [
            {
                icon: "🌡️",
                title: "Thermal Comfort",
                value: feelsDesc,
                cls: feelsClass,
            },
            {
                icon: "🏃",
                title: "Running / Jogging",
                value: runDesc,
                cls: runClass,
            },
            {
                icon: "🌳",
                title: "Outdoor Activity",
                value: outdoorDesc,
                cls: outdoorClass,
            },
            {
                icon: "🚗",
                title: "Driving Conditions",
                value: driveDesc,
                cls: driveClass,
            },
            {
                icon: "📊",
                title: "Pressure Trend",
                value: pressureDesc,
                cls: pressureClass,
            },
            {
                icon: "🤧",
                title: "Allergy Risk",
                value: allergyDesc,
                cls: allergyClass,
            },
        ];

        dom.comfortAnalysis.innerHTML = items
            .map(
                (i) => `
            <div class="comfort-item">
                <div class="comfort-icon">${i.icon}</div>
                <div class="comfort-title">${i.title}</div>
                <div class="comfort-value ${i.cls}">${i.value}</div>
            </div>`,
            )
            .join("");
    }

    // ===== MAIN SEARCH FLOW =====
    async function searchCity(city) {
        showLoader();
        try {
            const geo = await geocodeCity(city);
            saveToHistory(geo.name);
            const { weather, forecast, air } = await fetchAllData(
                geo.lat,
                geo.lon,
                geo,
            );
            renderAll(weather, forecast, air);
            showWeather();
        } catch (err) {
            showError(
                err.message === "City not found"
                    ? "City not found. Please check the name and try again."
                    : "Failed to fetch weather data. Please try again.",
            );
        }
    }

    async function searchByCoords(lat, lon) {
        showLoader();
        try {
            // Open-Meteo has no reverse geocoding, so the place is labelled by its coordinates
            const { weather, forecast, air } = await fetchAllData(lat, lon, {
                name: `My location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            });
            renderAll(weather, forecast, air);
            showWeather();
        } catch (err) {
            showError("Failed to fetch weather data. Please try again.");
        }
    }

    function renderAll(weather, forecast, air) {
        renderCurrent(weather);
        renderAirQuality(air);
        renderHourly(forecast);
        const dailyData = renderForecast(forecast);
        renderHourlyChart();
        renderTempRangeChart(dailyData);
        renderComfort(weather, forecast);
    }

    // ===== THEME =====
    function applyTheme(theme) {
        state.theme = theme;
        localStorage.setItem("sp_theme", theme);
        if (theme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            dom.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute("data-theme");
            dom.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    // ===== UNIT TOGGLE =====
    function applyUnits(units) {
        state.units = units;
        localStorage.setItem("sp_units", units);
        dom.unitToggle.querySelector(".unit-label").textContent =
            units === "metric" ? "°C" : "°F";
    }

    // ===== EVENT LISTENERS =====
    function init() {
        // Apply saved theme
        applyTheme(state.theme);

        // Apply saved units
        applyUnits(state.units);

        // Search on Enter
        dom.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = dom.searchInput.value.trim();
                if (val) {
                    searchCity(val);
                    dom.searchHistory.classList.remove("show");
                }
            }
        });

        // Search history — show on focus
        dom.searchInput.addEventListener("focus", () => {
            renderSearchHistory();
        });

        // Hide search history on outside click
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".header__search")) {
                dom.searchHistory.classList.remove("show");
            }
        });

        // Click on history item
        dom.searchHistory.addEventListener("click", (e) => {
            const item = e.target.closest(".search-history__item");
            if (item) {
                const city = item.dataset.city;
                dom.searchInput.value = city;
                searchCity(city);
                dom.searchHistory.classList.remove("show");
            }
        });

        // Geolocation
        dom.geoBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
                showError("Geolocation is not supported by your browser.");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    searchByCoords(pos.coords.latitude, pos.coords.longitude),
                () =>
                    showError(
                        "Unable to retrieve your location. Please allow location access.",
                    ),
            );
        });

        // Unit toggle
        dom.unitToggle.addEventListener("click", () => {
            const newUnits = state.units === "metric" ? "imperial" : "metric";
            applyUnits(newUnits);
            // Re-fetch if we have history
            if (state.history.length) searchCity(state.history[0]);
        });

        // Theme toggle
        dom.themeToggle.addEventListener("click", () => {
            applyTheme(state.theme === "dark" ? "light" : "dark");
            // Re-render charts with new colors
            renderHourlyChart();
        });

        // Chart tabs
        $$(".chart-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                $$(".chart-tab").forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                state.chartType = tab.dataset.chart;
                renderHourlyChart();
            });
        });

        // Error close
        dom.errorClose.addEventListener("click", () => {
            dom.errorBanner.classList.add("hidden");
        });

        // Load default city
        if (state.history.length) {
            searchCity(state.history[0]);
        } else {
            searchCity("Warsaw");
        }
    }

    // Boot
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
