import { fetchAPI } from "./api.js";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const gridEl = document.getElementById("watchlist-grid");
const loadingEl = document.getElementById("loading");
const emptyStateEl = document.getElementById("empty-state");
const countEl = document.getElementById("watchlist-count");

const loadWatchlist = async () => {
  gridEl.innerHTML = "";
  loadingEl.style.display = "block";
  emptyStateEl.style.display = "none";

  try {
    const data = await fetchAPI("/watchlist");
    
    loadingEl.style.display = "none";
    countEl.innerText = `${data.length} movies`;

    if (data.length === 0) {
      emptyStateEl.style.display = "block";
      return;
    }

    data.forEach(movie => {
      const posterUrl = movie.poster 
        ? (movie.poster.startsWith('http') ? movie.poster : `https://image.tmdb.org/t/p/w500${movie.poster}`) 
        : 'https://via.placeholder.com/500x750?text=No+Image';

      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `
        <div class="movie-card shadow-sm h-100" id="card-${movie.watchlist_id}">
          
            <button class="btn-remove" onclick="window.removeWatchlist(${movie.watchlist_id}, event)">
                <i class="fas fa-trash-alt"></i>
            </button>

            <div onclick="window.location.href='film-detail.html?id=${movie.tmdb_id}'">
                <img src="${posterUrl}" class="movie-poster" alt="${movie.title}">
                <div class="card-info">
                    <h6 class="card-title" title="${movie.title}">${movie.title}</h6>
                </div>
            </div>

        </div>
      `;
      gridEl.appendChild(col);
    });

  } catch (err) {
    console.error(err);
    loadingEl.style.display = "none";
    gridEl.innerHTML = `<div class="text-danger text-center w-100">Failed to load watchlist.</div>`;
  }
};

window.removeWatchlist = async (watchlistId, event) => {
  if(event) event.stopPropagation();

  const isConfirmed = confirm("Remove this movie from watchlist?");
  if (!isConfirmed) return;

  try {
    await fetchAPI(`/watchlist/${watchlistId}`, "DELETE");

    const card = document.getElementById(`card-${watchlistId}`);
    if (card) {
        card.parentElement.style.transition = "all 0.3s";
        card.parentElement.style.opacity = "0";
        card.parentElement.style.transform = "scale(0.8)";
        
        setTimeout(() => {
            card.parentElement.remove();
            
            if(document.querySelectorAll('.movie-card').length === 0) {
                emptyStateEl.style.display = "block";
            }

            const currentCount = parseInt(countEl.innerText) || 0;
            countEl.innerText = `${Math.max(0, currentCount - 1)} movies`;
            
        }, 300);
    }

  } catch (err) {
    console.error(err);
    alert("Failed to remove item.");
  }
};

loadWatchlist();