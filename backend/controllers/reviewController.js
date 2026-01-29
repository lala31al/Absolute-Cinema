const db = require('../config/db');

const upsertReview = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const review_id = req.params.id; 
        const { film_id, review_text } = req.body;

        if (review_id) {
            const [result] = await db.query(
                `UPDATE reviews SET review_text = ?, created_at = NOW() WHERE review_id = ? AND user_id = ?`,
                [review_text, review_id, user_id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Review not found' });
            return res.json({ message: 'Review updated' });
        } else {
            if (!film_id || !review_text) return res.status(400).json({ message: 'Data incomplete' });
            
            await db.query(
                `INSERT INTO reviews (user_id, film_id, review_text, created_at) VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE review_text = VALUES(review_text), created_at = NOW()`,
                [user_id, film_id, review_text]
            );
            
            const [rows] = await db.query(`SELECT review_id FROM reviews WHERE user_id = ? AND film_id = ?`, [user_id, film_id]);
            return res.json({ message: 'Review saved', review_id: rows[0]?.review_id });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error saving review', error: error.message });
    }
};

const getReviewsByFilm = async (req, res) => {
    try {
        const tmdb_id = req.params.film_id;
        const [filmRows] = await db.query(`SELECT film_id FROM films WHERE tmdb_id = ?`, [tmdb_id]);

        if (filmRows.length === 0) {
            return res.json([]); 
        }

        const localFilmId = filmRows[0].film_id;
        const [rows] = await db.query(
            `SELECT r.*, u.username 
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.film_id = ?
            ORDER BY r.created_at DESC`, 
            [localFilmId]
        );
        res.json(rows);

    } catch (error) {
        res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
};

const getReviewsByUser = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.*, f.title FROM reviews r JOIN films f ON r.film_id = f.film_id 
            WHERE r.user_id = ? ORDER BY r.created_at DESC`, 
            [req.params.user_id]
        );
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const getReviewById = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM reviews WHERE review_id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteReview = async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM reviews WHERE review_id = ? AND user_id = ?`, [req.params.id, req.user.user_id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = {
    upsertReview,
    getReviewsByFilm,
    getReviewsByUser,
    getReviewById,
    deleteReview
};