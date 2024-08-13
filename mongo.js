const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://javiercoronarv:${password}@fullstack-open-jcn.8fv7i.mongodb.net/phonebook?retryWrites=true&w=majority&appName=fullstack-open-jcn`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const userSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const User = mongoose.model('User', userSchema)

if (process.argv.length > 3) {
  const name = process.argv[3]
  const number = process.argv[4]
  const user = new User({
    name: name,
    number: number,
  })
  user.save().then((result) => {
    console.log(`Added ${user.name} with number ${user.number} to phonebook`)
    console.log(result)
    mongoose.connection.close()
  })
} else {
  User.find({}).then((persons) => {
    console.log('Phonebook:')
    persons.forEach((person) => console.log(`${person.name} ${person.number}`))
    mongoose.connection.close()
  })
}
