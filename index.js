const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())



morgan.token('data', function (req, res) {
  if (req.method === 'POST') {
    console.log("hi post")
    return JSON.stringify(req.body)
  } 
  else{
    return null
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get("/", (request, response) => {
  response.send("<h1>Hello, this is the backend of phoneboook</h1>")
}) 

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/info", (request, response) => {
  const date = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people right now</p><p>${date}</p>`)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)


  person ? response.json(person) : response.status(404).end()
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()  
})

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'duplicate name' 
    })
  }

  const person = {
    "id": Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    "name": body.name,
    "number": body.number
  }
  persons = persons.concat(person)
  response.json(person)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
