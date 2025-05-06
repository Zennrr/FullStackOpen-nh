import { useState, useEffect } from "react";
import axios from "axios";

const Weather = ({ capital }) => {
  const [weather, setWeather] = useState(null);
  const api_key = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    if (capital) {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${api_key}`
        )
        .then((response) => {
          setWeather(response.data);
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
        });
    }
  }, [capital, api_key]);

  if (!weather) return <div>Loading weather data...</div>;

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <div>Temperature: {weather.main.temp} °C</div>
      <div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
        />
      </div>
      <div>Wind: {weather.wind.speed} m/s</div>
    </div>
  );
};

export default Weather;
