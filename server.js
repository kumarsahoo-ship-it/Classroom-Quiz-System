const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// ✅ MongoDB connection (use env variable)
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("DB Connected"))
.catch(err => console.log("DB Error:", err));

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", UserSchema);

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.get("/test", (req, res) => {
  res.send("API working");
});

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const newUser = new User({ username, password });
  await newUser.save();

  res.send("User registered");
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (user) {
    res.send("Login successful");
  } else {
    res.send("Invalid credentials");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
