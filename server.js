const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= MONGODB CONNECT =================
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.log(err));


// ================= USER SCHEMA =================
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);


// ================= QUESTION SCHEMA =================
const QuestionSchema = new mongoose.Schema({
  testName: String,
  question: String,
  options: Array,
  answer: String,
  time: Number
});
const Question = mongoose.model("Question", QuestionSchema);


// ================= RESULT SCHEMA =================
const ResultSchema = new mongoose.Schema({
  username: String,
  testName: String,
  score: Number,
  total: Number
});
const Result = mongoose.model("Result", ResultSchema);


// ================= ROUTES =================

// HOME
app.get("/", (req, res) => {
  res.send("Server Running");
});


// ================= AUTH =================

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = new User({ username, password });
    await user.save();

    res.send("User registered");
  } catch (err) {
    console.log(err);
    res.status(500).send("Signup error");
  }
});


// LOGIN
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
    res.status(500).send("Login error");
  }
});


// ================= CREATE TEST =================
app.post("/add-question", async (req, res) => {
  try {
    const { testName, question, options, answer, time } = req.body;

    const newQ = new Question({
      testName,
      question,
      options,
      answer,
      time
    });

    await newQ.save();

    res.send("Question added");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding question");
  }
});


// ================= GET TESTS =================
app.get("/tests", async (req, res) => {
  try {
    const tests = await Question.distinct("testName");
    res.json(tests);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching tests");
  }
});


// ================= GET QUESTIONS =================
app.get("/questions/:testName", async (req, res) => {
  try {
    const data = await Question.find({
      testName: req.params.testName
    });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching questions");
  }
});


// ================= SAVE RESULT =================
app.post("/result", async (req, res) => {
  try {
    const { username, testName, score, total } = req.body;

    const newResult = new Result({
      username,
      testName,
      score,
      total
    });

    await newResult.save();

    res.send("Result saved");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving result");
  }
});


// ================= GET USER RESULTS =================
app.get("/results/:username", async (req, res) => {
  try {
    const data = await Result.find({
      username: req.params.username
    });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching results");
  }
});


// ================= LEADERBOARD =================
app.get("/leaderboard/:testName", async (req, res) => {
  try {
    const data = await Result.find({
      testName: req.params.testName
    }).sort({ score: -1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Leaderboard error");
  }
});


// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
