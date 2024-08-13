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
  const timeStamp = Date.now();
  const currentDate = new Date(timeStamp);
  User.find({}).then((persons) =>
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>`)
  );
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  User.findById(id)
    .then((requestedPerson) => {
      if (requestedPerson) {
        response.json(requestedPerson);
      } else {
        response.status(404).json({ error: "Person Profile does not exist" });
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  if (body === undefined) {
    return response.status(400).send({ error: "Missing fields to update" });
  }

  const updatedUser = {
    name: body.name,
    number: body.number,
  };

  const id = request.params.id;
  User.findByIdAndUpdate(id, updatedUser, { new: true })
    .then((updatedUser) => {
      if (updatedUser) {
        response.json(updatedUser);
      } else {
        response.status(404).json({ error: "Person Profile does not exist" });
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  User.findByIdAndDelete(id)
    .then(
      (deletedUser) => (response.json(deletedUser), response.status(202).end())
    )
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (body === undefined) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const user = new User({
    name: body.name,
    number: body.number,
  });

  user
    .save()
    .then((savedUser) => {
      const transformedUser = savedUser.toJSON();
      response.json(transformedUser);
      console.log("New User", transformedUser);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
