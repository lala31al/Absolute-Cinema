const db = require('../config/db');

const upsertReview = async (user_id, film_id, review_text) => {
    await db.query(
        `INSERT INTO reviews (user_id, film_id, review_text)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE review_text = ?`,
        [user_id, film_id, review_text, review_text]
    );
};

const getReviewsByFilmId = async (film_id) => {
    const [rows] = await db.query(
        `SELECT 
            r.review_id,
            r.review_text,
            r.created_at,
            u.user_id,
            u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.film_id = ?
        ORDER BY r.created_at DESC`,
        [film_id]
    );
    return rows;
};

const getReviewsByUserId = async (user_id) => {
    const [rows] = await db.query(
        `SELECT
            r.review_id,
            r.review_text,
            r.created_at,
            r.film_id,
            f.title,
            f.poster
        FROM reviews r
        JOIN films f ON r.film_id = f.film_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC`,
        [user_id]
    );
    return rows;
};

const getReviewById = async (review_id) => {
    const [rows] = await db.query(
        `SELECT
            r.review_id,
            r.review_text,
            r.created_at,
            r.film_id,
            u.user_id,
            u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.review_id = ?`,
        [review_id]
    );
    return rows[0];
};

const deleteReviewById = async (review_id, user_id) => {
    const [result] = await db.query(
        `DELETE FROM reviews
        WHERE review_id = ? AND user_id = ?`,
        [review_id, user_id]
    );
    return result.affectedRows;
};

const updateReviewById = async (review_id, user_id, review_text) => {
    const [result] = await db.query(
        `UPDATE reviews
        SET review_text = ?
        WHERE review_id = ? AND user_id = ?`,
        [review_text, review_id, user_id]
    );

    return result.affectedRows;
};

module.exports = {upsertReview,getReviewsByFilmId,getReviewsByUserId,getReviewById,deleteReviewById, updateReviewById};
