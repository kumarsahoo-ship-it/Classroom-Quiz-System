const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("YOUR_MONGO_URL")
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

app.get("/test", (req, res) => {
  res.send("API working");
});


const express = require("express");
const app = express();

app.use(express.json());

let users = [];

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.get("/test", (req, res) => {
  res.send("API working");
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  users.push({ username, password });
  res.send("User registered");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    res.send("Login successful");
  } else {
    res.send("Invalid credentials");
  }
});

app.listen(3000, () => {
  console.log("Server started");
});
