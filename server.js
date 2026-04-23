const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


// ================= SCHEMAS =================

// USER
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

// TEST (FULL TEST STORED IN ONE DOC)
const QuestionSchema = new mongoose.Schema({
  testName: String,
  questions: Array,
  time: Number
});
const Question = mongoose.model("Question", QuestionSchema);

// RESULT
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


// ================= CREATE / UPDATE TEST =================
app.post("/add-questions", async (req, res) => {
  try {
    const { testName, questions, time } = req.body;

    // 🔄 UPSERT (edit if exists, else create)
    await Question.findOneAndUpdate(
      { testName },
      { testName, questions, time },
      { upsert: true, new: true }
    );

    res.json({ message: "Test saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving test");
  }
});


// ================= GET TEST LIST =================
app.get("/tests", async (req, res) => {
  try {
    const tests = await Question.find({}, "testName");
    res.json(tests.map(t => t.testName));
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching tests");
  }
});


// ================= GET QUESTIONS (QUIZ PAGE) =================
app.get("/questions/:testName", async (req, res) => {
  try {
    const data = await Question.findOne({ testName: req.params.testName });

    if (!data) return res.json([]);

    res.json(
      data.questions.map(q => ({
        ...q,
        time: data.time
      }))
    );

  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching questions");
  }
});


// ================= GET FULL TEST (EDIT PAGE) =================
app.get("/test/:testName", async (req, res) => {
  try {
    const data = await Question.findOne({ testName: req.params.testName });

    if (!data) return res.json(null);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching test");
  }
});


// ================= SAVE RESULT =================
app.post("/result", async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();

    res.send("Result saved");

  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving result");
  }
});


// ================= USER RESULTS =================
app.get("/results/:username", async (req, res) => {
  try {
    const data = await Result.find({ username: req.params.username });
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
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
