import { useState } from 'react'

const Header = ({ text }) => <h1>{text}</h1>

const Anecdote = ({ text, votes }) => (
  <>
    <p>{text}</p>
    <p>has {votes} votes</p>
  </>
)

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>{text}</button>
)

const MostVoted = ({ anecdotes, votes }) => {
  const maxVotesIndex = votes.indexOf(Math.max(...votes))
  if (votes.every(vote => vote === 0)) {
    return (
      <div>
        <Header text="Anecdote with most votes" />
        <p>No votes yet</p>
      </div>
    )
  }
  
  return (
    <div>
      <Header text="Anecdote with most votes" />
      <Anecdote text={anecdotes[maxVotesIndex]} votes={votes[maxVotesIndex]} />
    </div>
  )
}

const AnecdoteOfTheDay = ({ anecdote, votes, handleVote, handleNext }) => (
  <div>
    <Header text="Anecdote of the day" />
    <Anecdote text={anecdote} votes={votes} />
    <div>
      <Button handleClick={handleVote} text="Vote" />
      <Button handleClick={handleNext} text="Next Anecdote" />
    </div>
  </div>
)

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when dianosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(Array(anecdotes.length).fill(0))

  const handleAnecdoteButton = () => {
    const randomIndex = Math.floor(Math.random() * anecdotes.length)
    setSelected(randomIndex)
  }

  const handleVoteButton = () => {
    const copy = [...votes]
    copy[selected] += 1
    setVotes(copy)
  }

  return (
    <div>
      <AnecdoteOfTheDay 
        anecdote={anecdotes[selected]} 
        votes={votes[selected]}
        handleVote={handleVoteButton}
        handleNext={handleAnecdoteButton}
      />
      <MostVoted anecdotes={anecdotes} votes={votes} />
    </div>
  )
}

export default App