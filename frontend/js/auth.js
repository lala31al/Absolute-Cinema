const API = "http://localhost:8000/api/auth";

const showAlert = (msg, type = "danger") => {
  document.getElementById("alert").innerHTML = `
    <div class="alert alert-${type}">${msg}</div>
  `;
};

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    return showAlert(data.message);
  }

  localStorage.setItem("token", data.token);
  location.href = "index.html";
}

async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    return showAlert(data.message);
  }

  showAlert("Register success, redirecting...", "success");
  setTimeout(() => location.href = "login.html", 1500);
}