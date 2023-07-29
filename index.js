const express = require("express")
const morgan = require("morgan")
const Persons = require("./models/persons.js")
const app = express()
app.use(express.static("build"))
app.use(express.json())


morgan.token("data", function (req, res) {
  if (req.method === "POST") {
    console.log("hi post")
    return JSON.stringify(req.body)
  } 
  else{
    return null
  }
})
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"))

app.get("/", (request, response) => {
  response.send("<h1>Hello, this is the backend of phoneboook</h1>")
}) 

app.get("/api/persons", (request, response) => {
  Persons.find({}).then(persons => {
    response.json(persons)
  })
})

app.get("/info", (request, response) => {
  const date = new Date()
  response.send(`<p>Phonebook has info for ${Persons.countDocuments({})} people right now</p><p>${date}</p>`)
})

app.get("/api/persons/:id", (request, response, next) => {
  Persons.findById(request.params.id).then(person => {
    if(person){
      response.json(person)
    }
    else{
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Persons.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error)) 
})

app.put("/api/persons/:id", (request, response, next) => {
  const updatedPerson = {
    "name": request.body.name,
    "number": request.body.number
  }
  Persons.findByIdAndUpdate(request.params.id, updatedPerson, {new: true, runValidators: true, context: "query"})
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: "name missing" 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: "number missing" 
    })
  }
  // if (Persons.find({name: body.name})) {
  //   return response.status(400).json({ 
  //     error: "duplicate name" 
  //   })
  // }

  const person = new Persons({
    "name": body.name,
    "number": body.number
  })
  
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }
  else if (error.name === "ValidationError") {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
