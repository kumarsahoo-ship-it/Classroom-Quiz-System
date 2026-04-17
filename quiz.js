let questions = [];

const testName = localStorage.getItem("testName");
document.getElementById("title").innerText = testName;

// LOAD QUESTIONS
fetch(`https://classroom-test-system.onrender.com/questions/${testName}`)
.then(res => res.json())
.then(data => {
    questions = data;
    loadQuiz();
});

// DISPLAY QUESTIONS
function loadQuiz() {
    const box = document.getElementById("quiz");

    questions.forEach((q, i) => {
        box.innerHTML += `
            <div class="question">
                <p>${i+1}. ${q.question}</p>

                ${q.options.map(opt => `
                    <label class="option">
                        <input type="radio" name="q${i}" value="${opt}">
                        ${opt}
                    </label>
                `).join("")}
            </div>
        `;
    });
}

// TIMER
let time = 60;

// after fetching questions
fetch(`https://classroom-test-system.onrender.com/questions/${testName}`)
.then(res => res.json())
.then(data => {
    questions = data;

    // ✅ take time from DB (first question)
    time = data[0].time || 60;

    loadQuiz();
});

// SUBMIT QUIZ
function submitQuiz() {

    clearInterval(timer);

    let score = 0;

    questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);

        if (selected && selected.value === q.answer) {
            score++;
        }
    });

    const user = localStorage.getItem("user");

    // SAVE RESULT
    fetch("https://classroom-test-system.onrender.com/result", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: user,
            testName: testName,
            score: score,
            total: questions.length
        })
    });

    alert(`Score: ${score}/${questions.length}`);

    window.location.href = "results.html";
}
let warningCount = 0;

document.addEventListener("visibilitychange", function () {

    if (document.hidden) {
        warningCount++;

        alert("⚠️ Do not switch tabs! Warning: " + warningCount);

        // ❌ Auto submit after 3 warnings
        if (warningCount >= 3) {
            alert("❌ Exam ended due to cheating!");
            submitQuiz();
        }
    }
});
