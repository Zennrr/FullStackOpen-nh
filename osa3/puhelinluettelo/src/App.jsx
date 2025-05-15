import { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification({ message: null, type: null })
    }, 5000)
  }

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons)
    })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    )

    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const changedPerson = { ...existingPerson, number: newNumber }

        personService
          .update(existingPerson.id, changedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : returnedPerson
              )
            )
            setNewName('')
            setNewNumber('')
            showNotification(`Updated ${returnedPerson.name}'s number`)
          })
          .catch((error) => {
            console.log('Error updating person:', error)

            if (error.response && error.response.status === 404) {
              showNotification(
                `Information of '${existingPerson.name}' has already been removed from server`,
                'error'
              )
              setPersons(persons.filter((p) => p.id !== existingPerson.id))
            } else {
              showNotification(
                `Error updating ${existingPerson.name}: ${
                  error.message || 'Unknown error'
                }`,
                'error'
              )
            }
          })
      }
      return
    }

    if (persons.some((person) => person.number === newNumber)) {
      showNotification(
        `The number ${newNumber} is already added to the phonebook`,
        'error'
      )
      return
    }

    const personObject = {
      name: newName,
      number: newNumber,
    }

    personService
      .create(personObject)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        showNotification(`Added ${returnedPerson.name}`)
      })
      .catch((error) => {
        console.log('Error creating person:', error.response.data)
        showNotification(
          `Error: ${error.response.data.error || 'An unknown error occurred'}`,
          'error'
        )
      })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id))
          showNotification(`Deleted ${name}`)
        })
        .catch(() => {
          showNotification(
            `The person '${name}' was already deleted from server`,
            'error'
          )
          setPersons(persons.filter((person) => person.id !== id))
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const personsToShow = filter
    ? persons.filter((person) =>
      person.name.toLowerCase().includes(filter.toLowerCase())
    )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification.message} type={notification.type} />

      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons personsToShow={personsToShow} handleDelete={deletePerson} />
    </div>
  )
}

export default App
