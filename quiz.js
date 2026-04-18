let questions = [];
let time = 0;
let timerInterval;

const testName = localStorage.getItem("testName");
const user = localStorage.getItem("user");

// ================= LOAD QUESTIONS =================
fetch(`https://classroom-test-system.onrender.com/questions/${testName}`)
.then(res => res.json())
.then(data => {

    console.log("Questions:", data);

    if (!data || data.length === 0) {
        alert("No questions found!");
        return;
    }

    questions = data;
    time = data[0].time || 60; // fallback if missing

    loadQuestions();
    startTimer();
})
.catch(err => {
    console.log("Quiz load error:", err);
    alert("Error loading quiz");
});


// ================= LOAD QUESTIONS =================
function loadQuestions() {

    const container = document.getElementById("quiz");

    container.innerHTML = "";

    questions.forEach((q, i) => {
        container.innerHTML += `
            <div class="card">
                <p><b>${i + 1}. ${q.question}</b></p>

                ${q.options.map(opt => `
                    <label>
                        <input type="radio" name="q${i}" value="${opt}">
                        ${opt}
                    </label><br>
                `).join("")}
            </div>
        `;
    });
}


// ================= TIMER =================
function startTimer() {

    const timerDisplay = document.getElementById("timer");

    timerInterval = setInterval(() => {

        time--;

        let h = Math.floor(time / 3600);
        let m = Math.floor((time % 3600) / 60);
        let s = time % 60;

        timerDisplay.innerText = 
            `Time Left: ${h}:${m}:${s}`;

        if (time <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }

    }, 1000);
}


// ================= SUBMIT =================
function submitQuiz() {

    clearInterval(timerInterval);

    let score = 0;

    questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === q.answer) {
            score++;
        }
    });

    fetch("https://classroom-test-system.onrender.com/result", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: user,
            testName: testName,
            score: score,
            total: questions.length
        })
    })
    .then(res => res.text())
    .then(data => {
        alert("Your Score: " + score);
        window.location.href = "results.html";
    })
    .catch(err => {
        console.log(err);
        alert("Error saving result");
    });
}


// ================= ANTI-CHEAT =================
let warning = 0;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        warning++;
        alert("Do not switch tabs! Warning: " + warning);

        if (warning >= 3) {
            alert("Exam ended due to cheating!");
            submitQuiz();
        }
    }
});

// Disable right-click
document.addEventListener("contextmenu", e => e.preventDefault());

// Disable copy
document.addEventListener("copy", e => e.preventDefault());
