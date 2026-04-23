const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// ================= SCHEMAS =================
const QuestionSchema = new mongoose.Schema({
  testName: { type: String, unique: true }, // 🔴 unique test
  questions: Array, // store full test
  time: Number
});

const Question = mongoose.model("Question", QuestionSchema);

const ResultSchema = new mongoose.Schema({
  username: String,
  testName: String,
  score: Number,
  total: Number
});
const Result = mongoose.model("Result", ResultSchema);

// ================= CREATE TEST =================
app.post("/add-questions", async (req, res) => {
  try {
    const { testName, questions, time } = req.body;

    // ❌ CHECK DUPLICATE
    const exists = await Question.findOne({ testName });
    if (exists) {
      return res.status(400).json({
        message: "Test already exists! Use different name"
      });
    }

    // ✅ SAVE FULL TEST
    const newTest = new Question({
      testName,
      questions,
      time
    });

    await newTest.save();

    res.json({ message: "Test Created Successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating test");
  }
});

// ================= GET TEST LIST =================
app.get("/tests", async (req, res) => {
  const tests = await Question.find({}, "testName");
  res.json(tests.map(t => t.testName));
});

// ================= GET QUESTIONS =================
app.get("/questions/:testName", async (req, res) => {
  const data = await Question.findOne({ testName: req.params.testName });

  if (!data) return res.json([]);

  res.json(data.questions.map(q => ({
    ...q,
    time: data.time
  })));
});

// ================= RESULT =================
app.post("/result", async (req, res) => {
  const r = new Result(req.body);
  await r.save();
  res.send("Result saved");
});

// ================= LEADERBOARD =================
app.get("/leaderboard/:testName", async (req, res) => {
  const data = await Result.find({ testName: req.params.testName })
    .sort({ score: -1 });

  res.json(data);
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
