const express = require("express");
const app = express();

app.use(express.json());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
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
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log("Body: ", body);

  if (body.name) {
    const nameAlreadyPresent = persons.some(
      (person) => person.name === body.name
    );
    if (nameAlreadyPresent) {
      return response
        .status(400)
        .json({ error: "The name already exists in the phonebook" });
    }
  }

  if (body.name && body.number) {
    const id = String(Math.floor(Math.random() * persons.length * 100));
    const newEntry = { name: body.name, number: body.number, id: id };
    persons = persons.concat(newEntry);
    response.json(newEntry);
  } else {
    return response.status(400).json({
      error: "The name or number is missing",
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
