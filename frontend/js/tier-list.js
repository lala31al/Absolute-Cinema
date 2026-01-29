import { fetchAPI } from "./api.js";

const gridEl = document.getElementById("tierlist-grid");
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

const loadTierLists = async () => {
    try {
        const lists = await fetchAPI("/tierlists");
        gridEl.innerHTML = "";

        if (lists.length === 0) {
            gridEl.innerHTML = `<p class="text-muted text-center w-100">No tier lists yet.</p>`;
            return;
        }

        lists.forEach(list => {
            const date = new Date(list.created_at).toLocaleDateString();
            gridEl.innerHTML += `
                <div class="col-md-4">
                    <div class="card tier-card h-100 p-4" onclick="window.location.href='tier-list-manage.html?id=${list.tier_list_id}'">
                        <h4 class="fw-bold text-warning mb-2">${list.title}</h4>
                        <p class="text-muted small mb-3">Created: ${date}</p>
                        <p class="text-light opacity-75">${list.description || "No description"}</p>
                        <div class="mt-auto pt-3 border-top border-secondary text-end">
                            <small class="text-info">Manage List <i class="fas fa-arrow-right ms-1"></i></small>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
    }
};

window.createTierList = async () => {
    const title = document.getElementById("tierTitle").value;
    const description = document.getElementById("tierDesc").value;

    if (!title) return alert("Title is required");

    try {
        const res = await fetchAPI("/tierlists", "POST", { title, description });
        alert("Tier list created!");
        window.location.href = `tier-list-manage.html?id=${res.tier_list_id}`;
    } catch (err) {
        alert("Failed to create");
    }
};

loadTierLists();