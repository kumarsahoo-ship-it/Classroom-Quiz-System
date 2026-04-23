const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// ================= DB =================
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


// ================= SCHEMAS =================

// USER
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

// TEST
const QuestionSchema = new mongoose.Schema({
  testName: String,
  questions: Array,
  time: Number,
  createdBy: String   // 🔥 OWNER
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
app.get("/", (req, res) => res.send("Server Running"));


// ================= AUTH =================
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  await new User({ username, password }).save();
  res.send("User registered");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (user) res.send("Login successful");
  else res.send("Invalid credentials");
});


// ================= CREATE / EDIT TEST =================
app.post("/add-questions", async (req, res) => {
  try {
    const { testName, questions, time, createdBy } = req.body;

    const existing = await Question.findOne({ testName });

    // ❌ BLOCK IF NOT OWNER
    if (existing && existing.createdBy !== createdBy) {
      return res.status(403).json({
        message: "❌ You are not allowed to edit this test"
      });
    }

    // ✅ CREATE OR UPDATE
    await Question.findOneAndUpdate(
      { testName },
      { testName, questions, time, createdBy },
      { upsert: true, new: true }
    );

    res.json({ message: "Test saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving test");
  }
});


// ================= GET ALL TESTS =================
app.get("/tests", async (req, res) => {
  const tests = await Question.find({}, "testName createdBy");
  res.json(tests);
});


// ================= GET QUESTIONS (QUIZ) =================
app.get("/questions/:testName", async (req, res) => {
  const data = await Question.findOne({ testName: req.params.testName });

  if (!data) return res.json([]);

  res.json(
    data.questions.map(q => ({
      ...q,
      time: data.time
    }))
  );
});


// ================= GET FULL TEST (EDIT) =================
app.get("/test/:testName", async (req, res) => {
  const data = await Question.findOne({ testName: req.params.testName });
  res.json(data);
});


// ================= SAVE RESULT =================
app.post("/result", async (req, res) => {
  await new Result(req.body).save();
  res.send("Result saved");
});


// ================= USER RESULTS =================
app.get("/results/:username", async (req, res) => {
  const data = await Result.find({ username: req.params.username });
  res.json(data);
});


// ================= LEADERBOARD =================
app.get("/leaderboard/:testName", async (req, res) => {
  const data = await Result.find({ testName: req.params.testName })
    .sort({ score: -1 });

  res.json(data);
});


// ================= SERVER =================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
