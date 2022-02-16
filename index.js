const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect(`mongodb://127.0.0.1:27017/UserData`);

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  city: { type: String, maxlength: 12 },
  dateOfBirth: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
const checkAge = (date) => {
  const DOB = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - DOB.getFullYear();
  return age > 14;
};
app.get("/userData", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email, password: password }, (er, found) => {
    if (!er) {
      return res.send({
        name: found.name,
        email: found.email,
        city: found.city,
        dateOfBirth: found.dateOfBirth,
      });
    } else {
      return res.send({ error: "Couldn’t connect to Database. " });
    }
  });
});

app.post("/register", (req, res) => {
  if (checkAge(req.body.dateOfBirth)) {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      city: req.body.city,
      dateOfBirth: req.body.dateOfBirth,
    });
    User.insertMany(newUser, (er) => {
      if (er) {
        res.send({ message: "User already resgisterd" });
      } else {
        res.send({ message: "User has been registered successfully" });
      }
    });
    // User.save();
  } else {
    res.send({ message: "Age should be above 14 years" });
  }
});

app.listen(8080, function () {
  console.log("serve started at 8080");
});
