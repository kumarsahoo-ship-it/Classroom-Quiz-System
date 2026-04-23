const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ================= DB =================
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= SCHEMA =================
const TestSchema = new mongoose.Schema({
  testName: String,
  questions: Array,
  time: Number
});

const Test = mongoose.model("Test", TestSchema);

const ResultSchema = new mongoose.Schema({
  username: String,
  testName: String,
  score: Number,
  total: Number
});

const Result = mongoose.model("Result", ResultSchema);

// ================= USER SCHEMA =================
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", UserSchema);


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ❌ check if user exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // ✅ create user
    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: "Signup successful" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Signup error");
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    res.json({
      message: "Login successful",
      username: user.username
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Login error");
  }
});
// ================= CREATE TEST =================
app.post("/add-questions", async (req, res) => {
  try {
    const { testName, questions, time } = req.body;

    // ❌ duplicate check
    const exists = await Test.findOne({ testName });
    if (exists) {
      return res.status(400).json({
        message: "Test already exists"
      });
    }

    // ❌ validation
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        message: "No questions"
      });
    }

    // ✅ save
    const newTest = new Test({ testName, questions, time });
    await newTest.save();

    res.json({ message: "Test Created" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// ================= GET TESTS =================
app.get("/tests", async (req, res) => {
  const data = await Test.find({}, "testName");
  res.json(data.map(t => t.testName));
});

// ================= GET QUESTIONS =================
app.get("/questions/:testName", async (req, res) => {
  const data = await Test.findOne({ testName: req.params.testName });

  if (!data) return res.json([]);

  res.json(data.questions.map(q => ({
    ...q,
    time: data.time
  })));
});

// ================= RESULT =================
app.post("/result", async (req, res) => {
  await new Result(req.body).save();
  res.send("Saved");
});

// ================= LEADERBOARD =================
app.get("/leaderboard/:testName", async (req, res) => {
  const data = await Result.find({ testName: req.params.testName })
    .sort({ score: -1 });

  res.json(data);
});

// ================= SERVER =================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));
