const mongoose = require("mongoose");
require("dotenv").config();

const password =
  process.argv.length >= 3 ? process.argv[2] : process.env.MONGODB_PASSWORD;

if (!password) {
  console.log(
    "No password provided. Either provide as argument or in .env file"
  );
  process.exit(1);
}

const url = process.env.MONGODB_URI.replace("${MONGODB_PASSWORD}", password);

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3 || process.argv.length === 1) {
  Person.find({}).then((persons) => {
    console.log("phonebook:");
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5 || process.argv.length === 3) {
  const name = process.argv.length === 5 ? process.argv[3] : process.argv[1];
  const number = process.argv.length === 5 ? process.argv[4] : process.argv[2];

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log("Invalid number of arguments");
  console.log("To add a person: node mongo.js <password> <name> <number>");
  console.log(
    "To add a person with .env password: node mongo.js <name> <number>"
  );
  console.log("To list all persons: node mongo.js <password>");
  console.log("To list all persons with .env password: node mongo.js");
  mongoose.connection.close();
}
