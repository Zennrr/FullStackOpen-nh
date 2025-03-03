import { useState } from 'react'

// otsikon komponentti
const Title = ({ text }) => (
  <h1>{text}</h1>
)

// napin komponentti
const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>
    {text}
  </button>
)

// statistiikka rivin komponentti
const StatisticLine = ({ text, value }) => (
  <tr>
    <td>{text}</td> 
    <td>{value}</td>
  </tr>
)

// statistiikka komponentti
const Statistics = ({ good, neutral, bad }) => {
  const total = good + neutral + bad

  if (total === 0) {
    return (
      <div>
        <Title text="statistics" />
        <p>No feedback given</p>
      </div>
    )
  }

  return (
    <div>
      <Title text="statistics" />
      <StatisticLine text="good" value={good} />
      <StatisticLine text="neutral" value={neutral} />
      <StatisticLine text="bad" value={bad} />
      <StatisticLine text="all" value={good + neutral + bad} />
      <StatisticLine text="average" value={(good - bad) / (good + neutral + bad)} />
      <StatisticLine text="positive" value={(good / (good + neutral + bad)) * 100 + ' %'} />
    </div>
  )
}

const App = () => {
  // tallenna napit omaan tilaansa
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <Title text="give feedback" />
      <Button handleClick={() => setGood(good + 1)} text="good" />
      <Button handleClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button handleClick={() => setBad(bad + 1)} text="bad" />
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App