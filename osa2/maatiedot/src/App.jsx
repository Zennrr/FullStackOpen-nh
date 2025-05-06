import { useState, useEffect } from "react";
import axios from "axios";
import Country from "./components/Country";
import CountryList from "./components/CountryList";

const App = () => {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    axios
      .get("https://studies.cs.helsinki.fi/restcountries/api/all")
      .then((response) => {
        setCountries(response.data);
      });
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setSelectedCountry(null);
  };

  const showCountry = (name) => {
    setSelectedCountry(name);
  };

  const filteredCountries = filter
    ? countries.filter((country) =>
        country.name.common.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  const countriesToShow = selectedCountry
    ? filteredCountries.filter(
        (country) => country.name.common === selectedCountry
      )
    : filteredCountries;

  return (
    <div>
      <div>
        find countries <input value={filter} onChange={handleFilterChange} />
      </div>

      {countriesToShow.length > 10 && (
        <div>Too many matches, specify another filter</div>
      )}

      {countriesToShow.length <= 10 && countriesToShow.length > 1 && (
        <CountryList countries={countriesToShow} showCountry={showCountry} />
      )}

      {countriesToShow.length === 1 && <Country country={countriesToShow[0]} />}
    </div>
  );
};

export default App;
