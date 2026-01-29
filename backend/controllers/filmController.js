const axios = require('axios');
const filmModel = require('../models/filmModel');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const saveFilmsToDB = async (movies) => {
    for (const movie of movies) {
        try {
            const detailRes = await axios.get(
                `${TMDB_BASE}/movie/${movie.id}`,
                { params: { api_key: API_KEY } }
            );
            const detail = detailRes.data;

            const creditsRes = await axios.get(
                `${TMDB_BASE}/movie/${movie.id}/credits`,
                { params: { api_key: API_KEY } }
            );
            
            const directorName = creditsRes.data.crew.find(p => p.job === "Director")?.name || null;

            await filmModel.insertFilm({
                tmdb_id: detail.id,
                title: detail.title,
                poster: detail.poster_path,
                release_date: detail.release_date,
                duration: detail.runtime,
                genres: JSON.stringify(detail.genres.map(g => g.id)),
                overview: detail.overview,         
                director: directorName             
            });
        } catch (err) {
            console.error(`Skipping film ${movie.id}: ${err.message}`);
        }
    }
};

exports.createFilm = async (req, res) => {
    try {
        const { tmdb_id } = req.body; 

        let film = await filmModel.findByTmdbId(tmdb_id);

        if (!film) {
            await saveFilmsToDB([{ id: tmdb_id }]);
            film = await filmModel.findByTmdbId(tmdb_id);
        }

        if (!film) throw new Error("Failed to save film");

        res.json({ film_id: film.film_id });

    } catch (error) {
        console.error("Create Film Error:", error.message);
        res.status(500).json({ message: 'Failed to create film' });
    }
};

exports.searchFilms = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        const response = await axios.get(`${TMDB_BASE}/search/movie`, {
            params: { api_key: API_KEY, query: query }
        });

        const movies = response.data.results;
        const formatted = movies.map(m => ({
            tmdb_id: m.id,
            title: m.title,
            poster: m.poster_path,
            release_date: m.release_date,
            overview: m.overview
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
};

exports.getHome = async (req, res) => {
    try {
        const tmdbRes = await axios.get(
            `${TMDB_BASE}/movie/now_playing`,
            { params: { api_key: API_KEY } }
        );
        const tmdbMovies = tmdbRes.data.results;

        await saveFilmsToDB(tmdbMovies);

        const films = await filmModel.getFilmsByTmdbIds(
            tmdbMovies.map(m => m.id)
        );

        res.json(films);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load home', error: error.message });
    }
};

exports.getPopular = async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/movie/popular`, { params: { api_key: API_KEY } });
        await saveFilmsToDB(response.data.results);
        
        const films = await filmModel.getFilmsByTmdbIds(response.data.results.map(m => m.id));
        res.json(films);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load popular', error: error.message });
    }
};

exports.getNowPlaying = async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/movie/now_playing`, { params: { api_key: API_KEY } });
        await saveFilmsToDB(response.data.results);
        
        const films = await filmModel.getFilmsByTmdbIds(response.data.results.map(m => m.id));
        res.json(films);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load now playing', error: error.message });
    }
};

exports.getFilmDetail = async (req, res) => {
    try {
        const filmId = req.params.id; // TMDB ID

        // Fetch TMDB
        const detailRes = await axios.get(`${TMDB_BASE}/movie/${filmId}`, { params: { api_key: API_KEY } });
        const creditsRes = await axios.get(`${TMDB_BASE}/movie/${filmId}/credits`, { params: { api_key: API_KEY } });

        const director = creditsRes.data.crew.find(p => p.job === "Director")?.name || null;
        const actors = creditsRes.data.cast.slice(0, 5).map(actor => actor.name);

        res.json({
        tmdb_id: detailRes.data.id,
        title: detailRes.data.title,
        overview: detailRes.data.overview,
        release_date: detailRes.data.release_date,
        duration: detailRes.data.runtime,
        poster: detailRes.data.poster_path,
        director,
        main_actor: actors
        });

    } catch (error) {
        console.error("Detail Error:", error.message);
        res.status(500).json({ message: 'Failed load film detail' });
    }
};