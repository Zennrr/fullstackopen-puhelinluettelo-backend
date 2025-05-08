const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

try {
  const rawData = fs.readFileSync("db.json");
  const database = JSON.parse(rawData);
  let persons = database.persons;

  app.use(cors());
  app.use(express.json());
  app.use(express.static("dist"));
  app.use(morgan("tiny"));

  morgan.token("post-data", (req) => {
    if (req.method === "POST") {
      return JSON.stringify(req.body);
    }
    return "";
  });

  app.use(
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :post-data"
    )
  );

  app.get("/api/persons", (request, response) => {
    response.json(persons);
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

    const updatedData = { persons: persons };
    fs.writeFileSync("db.json", JSON.stringify(updatedData, null, 2));

    response.status(204).end();
  });

  app.put("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    const body = request.body;

    if (!body.name || !body.number) {
      return response.status(400).json({
        error: "name or number missing",
      });
    }

    const updatedPerson = {
      name: body.name,
      number: body.number,
      id: id,
    };

    const index = persons.findIndex((person) => person.id === id);

    if (index === -1) {
      return response.status(404).json({
        error: "person not found",
      });
    }

    persons[index] = updatedPerson;

    const updatedData = { persons: persons };
    fs.writeFileSync("db.json", JSON.stringify(updatedData, null, 2));

    response.json(updatedPerson);
  });

  app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name) {
      return response.status(400).json({
        error: "name missing",
      });
    }

    if (!body.number) {
      return response.status(400).json({
        error: "number missing",
      });
    }

    const nameExists = persons.some(
      (person) => person.name.toLowerCase() === body.name.toLowerCase()
    );

    if (nameExists) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }

    const generateId = () => {
      return Math.floor(1000 + Math.random() * 998999).toString();
    };

    const newPerson = {
      name: body.name,
      number: body.number,
      id: generateId(),
    };

    persons = persons.concat(newPerson);

    const updatedData = { persons: persons };
    fs.writeFileSync("db.json", JSON.stringify(updatedData, null, 2));

    response.json(newPerson);
  });

  app.get("/info", (request, response) => {
    const date = new Date();
    const personCount = persons.length;

    response.send(`
      <p>Phonebook has info for ${personCount} people</p>
      <p>${date}</p>
    `);
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Server startup error:", error);
}
