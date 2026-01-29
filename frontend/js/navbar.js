const loadNavbar = async () => {
  const res = await fetch("components/navbar.html");
  const html = await res.text();
  document.body.insertAdjacentHTML("afterbegin", html);

  const navAuth = document.getElementById("nav-auth");
  const token = localStorage.getItem("token");
  const getUserName = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || "User";
    } catch { return "User"; }
  };

  if (token) {
    const username = getUserName();
    const initial = username.charAt(0).toUpperCase();

    navAuth.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="watchlist.html">My Watchlist</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="tier-list.html">Tier List</a>
      </li>
      
      <li class="nav-item dropdown ms-lg-3">
        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
          <div class="avatar-circle me-2">${initial}</div>
          <span>${username}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow border-secondary">
          <li><span class="dropdown-header text-muted">Account</span></li>
          <li><hr class="dropdown-divider border-secondary"></li>
          <li>
            <a class="dropdown-item text-danger" href="#" id="logoutBtn">
                <i class="fas fa-sign-out-alt me-2"></i>Logout
            </a>
          </li>
        </ul>
      </li>
    `;

    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    });

  } else {
    navAuth.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="login.html">Login</a>
      </li>
      <li class="nav-item ms-lg-2">
        <a class="btn btn-warning text-dark fw-bold px-4 rounded-pill" href="register.html">
            Register
        </a>
      </li>
    `;
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
};

loadNavbar();