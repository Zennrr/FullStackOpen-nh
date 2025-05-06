import Weather from "./Weather";

const Country = ({ country }) => {
  const capital =
    country.capital && country.capital.length > 0 ? country.capital[0] : null;

  return (
    <div>
      <h2>{country.name.common}</h2>
      {capital && <div>capital {capital}</div>}
      <div>area {country.area} km²</div>
      <h3>languages:</h3>
      <ul>
        {Object.values(country.languages).map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img
        src={country.flags.png}
        alt={`flag of ${country.name.common}`}
        width="150"
      />
      {capital && <Weather capital={capital} />}
    </div>
  );
};

export default Country;
