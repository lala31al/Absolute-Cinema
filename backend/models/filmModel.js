const db = require('../config/db');

const findByTmdbId = async (tmdb_id) => {
    const [rows] = await db.query('SELECT * FROM films WHERE tmdb_id = ?', [tmdb_id]);
    return rows[0];
};

const insertFilm = async (film) => {
    const { 
        tmdb_id, title, poster, release_date, 
        duration, genres, overview, director 
    } = film;

    await db.query(
        `INSERT INTO films 
        (tmdb_id, title, poster, release_date, duration, genres, overview, director)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        overview=VALUES(overview), director=VALUES(director), duration=VALUES(duration)`,
        [tmdb_id, title, poster, release_date, duration, genres, overview, director]
    );
};

const getFilmsByTmdbIds = async (ids) => {
    if (ids.length === 0) return [];

    const [rows] = await db.query(
        `SELECT 
            f.tmdb_id, f.title, f.poster, f.duration, f.genres,
            f.release_date, f.overview, f.director,
            AVG(r.rating) as average_rating
            FROM films f
            LEFT JOIN ratings r ON f.film_id = r.film_id
            WHERE f.tmdb_id IN (?)
            GROUP BY f.film_id`,
        [ids]
    );
    return rows;
};

const getFilmIdByTmdbId = async (tmdb_id) => { 
    const [rows] = await db.query('SELECT film_id FROM films WHERE tmdb_id = ?', [tmdb_id]);
    return rows[0];
};

const upsertFilmDetail = async (film) => { /*...*/ };

module.exports = { findByTmdbId, insertFilm, getFilmsByTmdbIds, upsertFilmDetail, getFilmIdByTmdbId };