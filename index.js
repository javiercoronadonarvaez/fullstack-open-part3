require("dotenv").config();
const express = require("express");
const app = express();
var morgan = require("morgan");

app.use(express.json());
morgan.token("body", function (request, response) {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const cors = require("cors");
app.use(cors());

app.use(express.static("dist"));

const User = require("./models/user");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

app.get("/api/persons", (request, response) => {
  User.find({}).then((persons) => response.json(persons));
});

app.get("/info", (request, response) => {
  const numberOfPeople = persons.length;
  const timeStamp = Date.now();
  const currentDate = new Date(timeStamp);
  response.send(`<p>Phonebook has info for ${numberOfPeople}</p>
                 <p>${currentDate}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).json({ error: "Person Profile does not exist" });
  }
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const id = body.id;
  console.log("Persons: ", persons);
  persons = persons.map((person) => (person.id === id ? body : person));
  console.log("Updated Persons: ", persons);
  response.json(body);
  response.status(204).end();
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  User.findByIdAndDelete(id)
    .then(
      (deletedUser) => (response.json(deletedUser), response.status(202).end())
    )
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body === undefined) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const user = User({
    name: body.name,
    number: body.number,
  });

  user.save().then((savedUser) => response.json(savedUser));

  // if (body.name) {
  //   const nameAlreadyPresent = persons.some(
  //     (person) => person.name === body.name
  //   );
  //   if (nameAlreadyPresent) {
  //     return response
  //       .status(400)
  //       .json({ error: "The name already exists in the phonebook" });
  //   }
  // }

  // if (body.name && body.number) {
  //   //const id = String(Math.floor(Math.random() * persons.length * 100));
  //   const id = body.id;
  //   const newEntry = { name: body.name, number: body.number, id: id };
  //   persons = persons.concat(newEntry);
  //   response.json(newEntry);
  //   console.log(newEntry);
  // } else {
  //   return response.status(400).json({
  //     error: "The name or number is missing",
  //   });
  // }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
