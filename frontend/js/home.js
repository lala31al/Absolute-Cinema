import { fetchAPI } from "./api.js";

const filmsContainer = document.getElementById("film-list");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("filter-genre");
const durationFilter = document.getElementById("filter-duration");
const ratingFilter = document.getElementById("filter-rating"); 
const sortSelect = document.getElementById("sort-by");
const resultCount = document.getElementById("result-count");

let allFilms = [];

const GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 18: "Drama", 10749: "Romance", 878: "Sci-Fi",
  27: "Horror", 53: "Thriller"
};

const setupHero = (film) => {
    if (!film) return;
    const heroSection = document.getElementById("hero-section");
    const bg = document.getElementById("hero-bg");
    const img = document.getElementById("hero-img");
    const title = document.getElementById("hero-title");
    const desc = document.getElementById("hero-desc");
    const year = document.getElementById("hero-year");
    const dur = document.getElementById("hero-duration");
    const genre = document.getElementById("hero-genre");
    const btn = document.getElementById("hero-btn");

    heroSection.style.display = "flex";
    const posterUrl = `https://image.tmdb.org/t/p/original${film.poster}`;
    bg.style.backgroundImage = `url('${posterUrl}')`;
    img.src = `https://image.tmdb.org/t/p/w500${film.poster}`;

    title.innerText = film.title;
    desc.innerText = film.overview ? (film.overview.substring(0, 150) + "...") : "No description available.";
    year.innerText = film.release_date ? film.release_date.split('-')[0] : "N/A";
    dur.innerText = film.duration ? `${film.duration} min` : "-";
    
    let genreList = "-";
    if(film.genres) {
        try {
            genreList = JSON.parse(film.genres).map(id => GENRES[id]).filter(Boolean).slice(0, 2).join(" • ");
        } catch(e) {}
    }
    genre.innerText = genreList;
    btn.href = `film-detail.html?id=${film.tmdb_id}`;
};

const renderFilms = (films) => {
    filmsContainer.innerHTML = "";
    resultCount.innerText = `${films.length} movies found`;

    if (films.length === 0) {
        filmsContainer.innerHTML = `<div class="col-12 text-center text-light py-5">No movies found.</div>`;
        return;
    }

    films.forEach(film => {
        const year = film.release_date ? film.release_date.split('-')[0] : "N/A";
        const hours = Math.floor((film.duration || 0) / 60);
        const minutes = (film.duration || 0) % 60;
        const durationText = film.duration ? `${hours}h ${minutes}m` : "-";
        const posterUrl = film.poster 
            ? `https://image.tmdb.org/t/p/w500${film.poster}` 
            : 'https://via.placeholder.com/300x450?text=No+Image';

        let ratingDisplay;
        if (film.average_rating && film.average_rating > 0) {
            ratingDisplay = Number(film.average_rating).toFixed(1);
        } else {
            ratingDisplay = "-";
        }

        filmsContainer.innerHTML += `
        <div class="col-6 col-md-4 col-lg-2 mb-4"> 
            <div class="movie-card" onclick="window.location.href='film-detail.html?id=${film.tmdb_id}'">
            <div class="poster-wrapper">
                <img src="${posterUrl}" class="movie-poster-img" loading="lazy" alt="${film.title}">
                <span class="rating-badge">
                    <i class="fas fa-star me-1 text-warning"></i>${ratingDisplay}
                </span>
            </div>
            <div class="movie-info">
                <h6 class="movie-title" title="${film.title}">${film.title}</h6>
                <div class="movie-meta">
                    <span>${year}</span>
                    <span><i class="far fa-clock me-1"></i>${durationText}</span>
                </div>
            </div>
            </div>
        </div>
        `;
    });
};

const loadHome = async () => {
  try {
      allFilms = await fetchAPI("/films/home");
      
      const heroFilm = allFilms.find(f => f.poster && f.overview) || allFilms[0];
      setupHero(heroFilm);

      allFilms.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

      applyFilters();
  } catch (err) {
      console.error(err);
  }
};

const applyFilters = () => {
  let filtered = [...allFilms];
  if (genreFilter.value) {
    filtered = filtered.filter(film => {
      if (!film.genres) return false;
      const genres = JSON.parse(film.genres);
      return genres.includes(Number(genreFilter.value));
    });
  }

  if (durationFilter.value) {
    filtered = filtered.filter(film => {
      if (!film.duration) return false;
      if (durationFilter.value === "short") return film.duration < 90;
      if (durationFilter.value === "medium") return film.duration >= 90 && film.duration <= 120;
      if (durationFilter.value === "long") return film.duration > 120;
    });
  }

  if (ratingFilter.value) {
      const minRating = Number(ratingFilter.value);
      filtered = filtered.filter(film => {
          const rating = Number(film.average_rating) || 0;
          return rating >= minRating;
      });
  }

  switch (sortSelect.value) {
    case "title-asc":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "duration-desc":
      filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
      break;
    case "rating-desc":
        filtered.sort((a, b) => (Number(b.average_rating) || 0) - (Number(a.average_rating) || 0));
        break;
    case "latest":
    default:
      filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      break;
  }

  renderFilms(filtered);
};

genreFilter.addEventListener("change", applyFilters);
durationFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("change", applyFilters); 
sortSelect.addEventListener("change", applyFilters);

let searchTimeout;
searchInput.addEventListener("keyup", () => {
    clearTimeout(searchTimeout);

    if (!searchInput.value) {
        allFilms = [...allFilms]; 
        loadHome(); 
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const results = await fetchAPI(`/films/search?q=${searchInput.value}`);
            renderFilms(results);
        } catch (err) {
            console.error(err);
        }
    }, 500); 
});

loadHome();