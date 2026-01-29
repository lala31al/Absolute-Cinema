const db = require('../config/db');

const upsertRating = async (user_id, film_id, rating) => {
    const [result] = await db.query(
        `
        INSERT INTO ratings (user_id, film_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        rating = VALUES(rating)
        `,
        [user_id, film_id, rating]
    );

    return result.affectedRows === 2;
};

const getFilmRatingSummary = async (film_id, user_id) => {
    const [rows] = await db.query(
        `
        SELECT
            ROUND(AVG(r.rating), 1) AS average_rating,
            COUNT(r.rating) AS total_ratings,
            (
                SELECT rating
                FROM ratings
                WHERE film_id = ? AND user_id = ?
            ) AS my_rating
        FROM ratings r
        WHERE r.film_id = ?
        `,
        [film_id, user_id, film_id]
    );

    return rows[0];
};

const deleteRating = async (user_id, film_id) => {
    const [result] = await db.query(
        `DELETE FROM ratings WHERE user_id = ? AND film_id = ?`,
        [user_id, film_id]
    );
    return result.affectedRows;
};

module.exports = {upsertRating,getFilmRatingSummary, deleteRating};