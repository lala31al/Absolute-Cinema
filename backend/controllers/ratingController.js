const db = require('../config/db');

const upsertRating = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { film_id, rating } = req.body;

        if (!film_id || rating === undefined) {
            return res.status(400).json({ message: 'Film ID and rating are required' });
        }

        if (rating < 1 || rating > 10) {
            return res.status(400).json({ message: 'Rating must be between 1 and 10' });
        }

        const [result] = await db.query(
            `INSERT INTO ratings (user_id, film_id, rating)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            rating = VALUES(rating)`,
            [user_id, film_id, rating]
        );

        res.json({ message: 'Rating saved successfully' });

    } catch (error) {
        console.error("Rating Error:", error.message);
        res.status(500).json({ message: 'Failed to save rating', error: error.message });
    }
};

const getFilmRating = async (req, res) => {
    try {
        const filmIdParam = req.params.film_id; 
        const user_id = req.user ? req.user.user_id : null;
        const [filmRows] = await db.query(`SELECT film_id FROM films WHERE tmdb_id = ?`, [filmIdParam]);
        
        if (filmRows.length === 0) {
            return res.json({ average_rating: null, total_ratings: 0, my_rating: null });
        }

        const localFilmId = filmRows[0].film_id;

        const [rows] = await db.query(
            `SELECT
                ROUND(AVG(rating), 1) as average_rating,
                COUNT(rating) as total_ratings,
                (SELECT rating FROM ratings WHERE film_id = ? AND user_id = ?) as my_rating
                FROM ratings
                WHERE film_id = ?`,
            [localFilmId, user_id, localFilmId]
        );

        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get rating' });
    }
};

const deleteRating = async (req, res) => {
    try {
        const film_id = req.params.film_id;
        const user_id = req.user.user_id;

        await db.query(`DELETE FROM ratings WHERE user_id = ? AND film_id = ?`, [user_id, film_id]);
        
        res.json({ message: 'Rating deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed delete rating' });
    }
};

module.exports = { upsertRating, getFilmRating, deleteRating };