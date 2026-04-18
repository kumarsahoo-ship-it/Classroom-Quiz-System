let questions = [];
let time = 0;
let warning = 0;

const testName = localStorage.getItem("testName");
const user = localStorage.getItem("user");

// LOAD
fetch(`https://classroom-test-system.onrender.com/questions/${testName}`)
.then(res => res.json())
.then(data => {
    questions = data;
    time = data[0].time;
    load();
});

// LOAD QUESTIONS
function load() {
    const box = document.getElementById("quiz");

    questions.forEach((q,i)=>{
        box.innerHTML += `
            <p>${i+1}. ${q.question}</p>
            ${q.options.map(opt=>`
                <label>
                    <input type="radio" name="q${i}" value="${opt}">
                    ${opt}
                </label><br>
            `).join("")}
            <hr>
        `;
    });

    startTimer();
}

// TIMER
function startTimer() {
    const t = setInterval(()=>{
        time--;

        let h = Math.floor(time/3600);
        let m = Math.floor((time%3600)/60);
        let s = time%60;

        document.getElementById("timer").innerText =
            `Time Left: ${h}:${m}:${s}`;

        if(time<=0){
            clearInterval(t);
            submitQuiz();
        }
    },1000);
}

// SUBMIT
function submitQuiz(){
    let score=0;

    questions.forEach((q,i)=>{
        const sel=document.querySelector(`input[name="q${i}"]:checked`);
        if(sel && sel.value===q.answer) score++;
    });

    fetch("https://classroom-test-system.onrender.com/result",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username:user,
            testName,
            score,
            total:questions.length
        })
    });

    alert(`Score: ${score}`);
    window.location.href="results.html";
}

// TAB SWITCH DETECT
document.addEventListener("visibilitychange", ()=>{
    if(document.hidden){
        warning++;
        alert("Do not switch tabs! Warning: "+warning);

        if(warning>=3){
            alert("Exam ended due to cheating!");
            submitQuiz();
        }
    }
});

// DISABLE RIGHT CLICK
document.addEventListener("contextmenu", e=>e.preventDefault());

// DISABLE COPY
document.addEventListener("copy", e=>e.preventDefault());
