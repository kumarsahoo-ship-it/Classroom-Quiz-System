const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// ✅ MongoDB connection (use env variable)
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("DB Connected"))
.catch(err => console.log("MongoDB error:", err));

mongoose.connection.on("error", err => {
    console.log("MongoDB error:", err);
});

mongoose.connection.once("open", () => {
    console.log("MongoDB connected successfully");
});

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

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (user) {
      res.send("Login successful");
    } else {
      res.send("Invalid credentials");
    }
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// ================= QUESTION MODEL =================
const QuestionSchema = new mongoose.Schema({
  testName: String,
  question: String,
  options: Array,
  answer: String
});
const Question = mongoose.model("Question", QuestionSchema);

// ================= RESULT MODEL =================
const ResultSchema = new mongoose.Schema({
  username: String,
  testName: String,
  score: Number,
  total: Number
});
const Result = mongoose.model("Result", ResultSchema);

// ================= ADD QUESTION =================
app.post("/add-question", async (req, res) => {
  const q = new Question(req.body);
  await q.save();
  res.send("Question saved");
});

// ================= GET TEST LIST =================
app.get("/tests", async (req, res) => {
  const tests = await Question.distinct("testName");
  res.json(tests);
});

// ================= GET QUESTIONS BY TEST =================
app.get("/questions/:testName", async (req, res) => {
  const data = await Question.find({ testName: req.params.testName });
  res.json(data);
});

// ================= SAVE RESULT =================
app.post("/result", async (req, res) => {
  const r = new Result(req.body);
  await r.save();
  res.send("Result saved");
});

// ================= GET RESULTS =================
app.get("/results/:username", async (req, res) => {
  const data = await Result.find({ username: req.params.username });
  res.json(data);
});

const QuestionSchema = new mongoose.Schema({
  testName: String,
  question: String,
  options: Array,
  answer: String,
  time: Number   // ⏱️ time in seconds
});

// ================= LEADERBOARD =================
// ================= LEADERBOARD =================
app.get("/leaderboard/:testName", async (req, res) => {
  try {
    const data = await Result.find({
      testName: req.params.testName
    }).sort({ score: -1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});
