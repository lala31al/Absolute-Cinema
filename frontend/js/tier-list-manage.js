import { fetchAPI } from "./api.js";

const params = new URLSearchParams(window.location.search);
const listId = params.get("id");
const token = localStorage.getItem("token");

if (!token || !listId) window.location.href = "tier-list.html";

const searchInput = document.getElementById("searchFilm");
const resultsDiv = document.getElementById("searchResults");
const container = document.getElementById("filmContainer");

let currentFilms = [];

const loadData = async () => {
    try {
        const data = await fetchAPI(`/tierlists/${listId}`);
        
        document.getElementById("listTitle").innerText = data.title;
        document.getElementById("listDesc").innerText = data.description || "No description";

        currentFilms = data.films || [];

        renderFilmList();

    } catch (err) {
        console.error(err);
    }
};

const renderFilmList = () => {
    container.innerHTML = "";

    if (currentFilms.length > 0) {
        currentFilms.forEach((film, index) => {
            const poster = film.poster ? `https://image.tmdb.org/t/p/w200${film.poster}` : 'https://via.placeholder.com/100';
            const isFirst = index === 0;
            const isLast = index === currentFilms.length - 1;

            container.innerHTML += `
                <div class="film-item d-flex align-items-center p-3 rounded mb-2" style="background: #1e1e1e; border: 1px solid #333;">
                    
                    <div class="fw-bold fs-4 me-3 text-warning" style="min-width: 30px; text-align: center;">
                        ${index + 1}
                    </div>
                    
                    <img src="${poster}" style="height: 60px; width: 40px; object-fit: cover;" class="rounded me-3">
                    
                    <div class="flex-grow-1">
                        <h6 class="mb-0 text-white fw-bold">${film.title}</h6>
                        <small class="text-muted">${film.release_date ? film.release_date.split('-')[0] : '-'}</small>
                    </div>
                    
                    <div class="d-flex flex-column gap-1 me-2">
                        ${!isFirst ? `
                            <button class="btn btn-sm btn-dark border-secondary py-0" onclick="window.moveFilm(${index}, 'up')" title="Move Up">
                                <i class="fas fa-chevron-up text-light" style="font-size: 0.7rem;"></i>
                            </button>
                        ` : '<div style="height: 22px;"></div>'} ${!isLast ? `
                            <button class="btn btn-sm btn-dark border-secondary py-0" onclick="window.moveFilm(${index}, 'down')" title="Move Down">
                                <i class="fas fa-chevron-down text-light" style="font-size: 0.7rem;"></i>
                            </button>
                        ` : '<div style="height: 22px;"></div>'}
                    </div>

                    <button class="btn btn-sm text-danger hover-bg-danger ms-2" onclick="window.removeFilm(${film.film_id})" title="Remove">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        });
    } else {
        container.innerHTML = `<div class="alert alert-dark text-center py-4 text-dark-50">This list is empty. Start adding movies!</div>`;
    }
};

window.moveFilm = async (index, direction) => {
    if (direction === 'up' && index > 0) {
        [currentFilms[index], currentFilms[index - 1]] = [currentFilms[index - 1], currentFilms[index]];
    } else if (direction === 'down' && index < currentFilms.length - 1) {
        [currentFilms[index], currentFilms[index + 1]] = [currentFilms[index + 1], currentFilms[index]];
    } else {
        return; 
    }

    renderFilmList();
    const payload = currentFilms.map((film, i) => ({
        film_id: film.film_id,
        position: i + 1
    }));

    try {
        await fetchAPI(`/tierlists/${listId}/films/order`, "PUT", { films: payload });
        console.log("Order updated!");
    } catch (err) {
        console.error("Failed to update order:", err);
        alert("Gagal menyimpan urutan.");
        loadData();
    }
};

let searchTimeout;

if (searchInput) {
    searchInput.addEventListener("keyup", () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value;

        if (query.length < 3) {
            resultsDiv.innerHTML = "";
            resultsDiv.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const films = await fetchAPI(`/films/search?q=${query}`);
                renderSearchResults(films);
            } catch (err) {
                console.error(err);
            }
        }, 500);
    });
}

const renderSearchResults = (films) => {
    resultsDiv.innerHTML = "";
    
    if (films.length > 0) {
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
        return;
    }

    films.forEach(film => {
        const item = document.createElement("a");
        item.className = "list-group-item list-group-item-action bg-dark text-white border-secondary d-flex align-items-center p-2";
        item.style.cursor = "pointer";
        
        const poster = film.poster ? `https://image.tmdb.org/t/p/w92${film.poster}` : 'https://via.placeholder.com/45';

        item.innerHTML = `
            <img src="${poster}" style="width: 40px; height: 60px; object-fit: cover;" class="me-3 rounded">
            <div>
                <h6 class="mb-0 fs-6">${film.title}</h6>
                <small class="text-muted" style="font-size: 0.75rem;">${film.release_date ? film.release_date.split('-')[0] : '-'}</small>
            </div>
        `;

        item.onclick = () => addToTierList(film);
        
        resultsDiv.appendChild(item);
    });
};

const addToTierList = async (filmData) => {
    try {
        searchInput.value = "Adding...";
        resultsDiv.style.display = 'none';

        const saveRes = await fetchAPI("/films", "POST", { tmdb_id: filmData.tmdb_id });
        if (!saveRes || !saveRes.film_id) throw new Error("Gagal menyimpan film.");
        
        const localFilmId = saveRes.film_id;
        const newPosition = currentFilms.length + 1;

        await fetchAPI(`/tierlists/${listId}/films`, "POST", {
            film_id: localFilmId,
            position: newPosition
        });

        searchInput.value = "";
        loadData();

    } catch (err) {
        console.error(err);
        alert("Gagal menambahkan film.");
        searchInput.value = "";
    }
};

window.removeFilm = async (filmId) => {
    if(!confirm("Hapus film ini dari list?")) return;
    try {
        await fetchAPI(`/tierlists/${listId}/films/${filmId}`, "DELETE");
        loadData();
    } catch(err) {
        console.error(err);
        alert("Gagal menghapus film.");
    }
};

window.deleteList = async () => {
    if(!confirm("Yakin ingin menghapus seluruh Tier List ini?")) return;
    try {
        await fetchAPI(`/tierlists/${listId}`, "DELETE");
        window.location.href = "tier-list.html";
    } catch(err) {
        console.error(err);
        alert("Gagal menghapus Tier List.");
    }
}

loadData();