function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("https://classroom-test-system.onrender.com/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.text())
    .then(data => {
        if (data === "Login successful") {
            alert("Login successful");
            
            // 🔥 Redirect to dashboard
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid credentials");
        }
    });
}
function signupUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("https://classroom-test-system.onrender.com/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);

        // 🔥 Redirect to login page after signup
        window.location.href = "login.html";
    })
    .catch(err => {
        console.log(err);
    });
}

