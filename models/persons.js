const mongoose = require("mongoose")
require("dotenv").config()
const url = process.env.MONGODB_URL

mongoose.set("strictQuery",false)
console.log("connecting to", url)

mongoose.connect(url)
  .then(result => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3
  },
  number: {
    type: String,
    validate: {
      validator: function(num) {
        const numberRegexExp = new RegExp(/(\d{2}|\d{3})-\d+/)
        return numberRegexExp.test(num)
      },
      message: props => `${props.value} is not a valid phone number, a valid number needs to have 2 or 3 digits followed by a dash followed by one or more digits`
    }
  }
})

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Person", personSchema)