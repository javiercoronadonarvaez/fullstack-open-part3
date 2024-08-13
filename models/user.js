const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose
  .connect(url)
  .then((result) => (console.log('Correctly connected'), console.log(result)))
  .catch((error) => `Failed to connect with error ${error.message}`)

const userSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
    required: true,
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('User', userSchema)
