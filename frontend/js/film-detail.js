import { fetchAPI } from "./api.js";

const params = new URLSearchParams(window.location.search);
const filmId = params.get("id");
const token = localStorage.getItem("token");

let myReview = null;
let myRating = null;
let currentFilm = null;
let isInWatchlist = false;
let watchlistId = null;


const getUserIdFromToken = () => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

const currentUserId = getUserIdFromToken();

const submitReview = async () => {
  const review_text = document.getElementById("reviewText").value.trim();
  const rating = Number(document.getElementById("rating").value);

  if (!review_text || !rating) {
    alert("Rating & review required");
    return;
  }

  try {
    const filmRes = await fetchAPI("/films", "POST", {
        tmdb_id: filmId 
    });

    if (!filmRes || !filmRes.film_id) {
        throw new Error("Gagal mendaftarkan film ke database.");
    }

    const localFilmId = filmRes.film_id;

    let reviewResult = null;

    if (myReview) {
      await fetchAPI(`/reviews/${myReview.review_id}`, "PUT", {
        review_text
      });
      myReview.review_text = review_text;

    } else {
      reviewResult = await fetchAPI("/reviews", "POST", {
        film_id: localFilmId, 
        review_text
      });

      myReview = {
        review_id: reviewResult.review_id,
        review_text,
        user_id: currentUserId
      };
    }

    await fetchAPI("/ratings", "POST", {
      film_id: localFilmId,
      rating
    });

    alert("Review & rating saved!");

    await renderReviewForm();
    await loadReviews();
    await loadRating();

  } catch (err) {
    console.error(err);
    alert("Failed to save review: " + (err.message || "Unknown error"));
  }
};

const deleteMyReview = async () => {
  if (!confirm("Delete your review & rating?")) return;

  try {
    const filmRes = await fetchAPI("/films", "POST", { tmdb_id: filmId });
    const localFilmId = filmRes.film_id;

    if (myReview) {
        await fetchAPI(`/reviews/${myReview.review_id}`, "DELETE");
    }
    
    await fetchAPI(`/ratings/film/${localFilmId}`, "DELETE");

    myReview = null;
    alert("Review & rating deleted");

    await loadReviews();
    await loadRating();
  } catch (err) {
    console.error(err);
    alert("Failed to delete review");
  }
};

const loadRating = async () => {
  const ratingSummary = document.getElementById("rating-summary");
  if (!ratingSummary) return;

  try {
    const data = await fetchAPI(`/ratings/film/${filmId}`); 

    ratingSummary.innerHTML = `
      <h5 class="text-warning">
        ⭐ ${data.average_rating ?? "-"} / 10
        <small class="text-light">(${data.total_ratings ?? 0} ratings)</small>
      </h5>
    `;
  } catch {
    ratingSummary.innerHTML = `
      <h5 class="text-light">No ratings yet</h5>
    `;
  }
};

const loadReviews = async () => {
  const reviewsEl = document.getElementById("reviews");
  reviewsEl.innerHTML = "";
  myReview = null;

  try {
    const reviews = await fetchAPI(`/reviews/film/${filmId}`);

    if(Array.isArray(reviews)){
        reviews.forEach(r => {
        if (Number(r.user_id) === Number(currentUserId)) {
            myReview = r;
        }

        reviewsEl.innerHTML += `
            <div class="border-bottom border-secondary pb-2 mb-3">
            <strong class="text-info">${r.username}</strong>
            <small class="text-light ms-2">
                ${new Date(r.created_at).toLocaleDateString()}
            </small>
            <p class="mb-0">${r.review_text}</p>
            </div>
        `;
        });
    }
  } catch {
    reviewsEl.innerHTML = `<p class="text-light opacity-50">No reviews yet.</p>`;
  }

  await renderReviewForm();
};

const renderReviewForm = async () => {
  const reviewForm = document.getElementById("review-form");

  if (!token) {
    reviewForm.innerHTML = `
      <div class="alert alert-dark border-secondary d-flex align-items-center">
        <i class="fas fa-lock me-3 text-warning"></i>
        <div>Please <a href="login.html" class="text-warning fw-bold">login</a> to write a review.</div>
      </div>
    `;
    return;
  }

  let myRatingVal = "";
  try {
      const ratingData = await fetchAPI(`/ratings/film/${filmId}`);
      if(ratingData.my_rating) myRatingVal = ratingData.my_rating;
  } catch {}

  const isEditing = myReview || myRatingVal;

  reviewForm.innerHTML = `
    <div class="card bg-dark border-secondary">
        <div class="card-body">
            <h5 class="text-warning mb-3">${isEditing ? "Edit Your Review" : "Write a Review"}</h5>

            <div class="mb-3">
                <textarea id="reviewText" class="form-control bg-dark text-white border-secondary" rows="3" placeholder="What did you think of the movie?">${myReview?.review_text || ""}</textarea>
            </div>

            <div class="row align-items-center">
                <div class="col-md-4 mb-2 mb-md-0">
                    <div class="input-group">
                        <span class="input-group-text bg-secondary text-white border-secondary"><i class="fas fa-star"></i></span>
                        <input type="number" id="rating" min="1" max="10" class="form-control bg-dark text-white border-secondary" placeholder="1-10" value="${myRatingVal}">
                    </div>
                </div>
                <div class="col-md-8 text-end">
                    ${isEditing ? `
                        <button id="deleteReview" class="btn btn-outline-danger me-2">Delete</button>
                        <button id="submitReview" class="btn btn-warning">Update</button>
                    ` : `
                        <button id="submitReview" class="btn btn-warning px-4 fw-bold">Post Review</button>
                    `}
                </div>
            </div>
        </div>
    </div>
  `;

  document.getElementById("submitReview").addEventListener("click", submitReview);
  if(isEditing) {
      document.getElementById("deleteReview").addEventListener("click", deleteMyReview);
  }
};

const loadDetail = async () => {
  try {
    const film = await fetchAPI(`/films/${filmId}`);
    currentFilm = film;

    const backdrop = film.backdrop || film.poster || film.poster_path;
    if (backdrop) {
        const bg = document.getElementById("backdrop-bg");
        if(bg) bg.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdrop})`;
    }

    const posterUrl = film.poster || film.poster_path 
        ? `https://image.tmdb.org/t/p/w500${film.poster || film.poster_path}` 
        : 'https://via.placeholder.com/500x750';
    
    document.getElementById("poster").src = posterUrl;
    document.getElementById("title").innerText = film.title;
    
    document.getElementById("meta-duration").innerText = film.duration ? `${film.duration} min` : "-";
    document.getElementById("meta-date").innerText = film.release_date ? film.release_date.split('-')[0] : "-";
    
    document.getElementById("overview").innerText = film.overview || "No overview available.";
    document.getElementById("director").innerText = film.director || "-";

    let actors = film.main_actor;
    if (typeof actors === "string") {
        try { actors = JSON.parse(actors); } catch {}
    }

    const actorsEl = document.getElementById("actors");
    actorsEl.innerHTML = "";

    if (Array.isArray(actors) && actors.length) {
        actors.forEach(actor => {
        actorsEl.innerHTML += `<span class="badge badge-custom me-1 mb-1">${actor}</span>`;
        });
    } else {
        actorsEl.innerHTML = `<span class="text-muted small">No cast info</span>`;
    }
  } catch (error) {
    console.error("Detail Error:", error);
  }
};

const checkWatchlist = async () => {
  if (!token || !currentFilm) return;

  try {
    const res = await fetchAPI(`/watchlist/check/${filmId}`);
    isInWatchlist = res.in_watchlist;
    watchlistId = res.watchlist_id;
    updateWatchlistBtn();
  } catch (e) { console.log(e); }
};

const updateWatchlistBtn = () => {
    const btn = document.getElementById('watchlistBtn');
    if(!btn) return;

    if (isInWatchlist) {
        btn.innerHTML = '<i class="fas fa-check me-2"></i>In Watchlist';
        btn.classList.replace('btn-outline-warning', 'btn-warning');
        btn.classList.add('text-dark');
    } else {
        btn.innerHTML = '<i class="fas fa-plus me-2"></i>Add to Watchlist';
        btn.classList.replace('btn-warning', 'btn-outline-warning');
        btn.classList.remove('text-dark');
    }
}

const watchlistBtn = document.getElementById('watchlistBtn');
if (watchlistBtn) {
  watchlistBtn.addEventListener('click', async () => {
    if (!token) { alert('Please login first'); return; }

    try {
      if (isInWatchlist && watchlistId) {
        await fetchAPI(`/watchlist/${watchlistId}`, 'DELETE');
      } else {
        await fetchAPI('/watchlist', 'POST', {
            tmdb_id: filmId,
            title: currentFilm.title,
            poster_path: currentFilm.poster || currentFilm.poster_path
        });
      }
      await checkWatchlist();
    } catch (err) {
      console.error(err);
    }
  });
}

const init = async () => {
  await loadDetail();
  await loadReviews();
  await loadRating();
  await checkWatchlist();
};

init();