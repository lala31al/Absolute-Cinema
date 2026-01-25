const pool = require('../config/db');

// =======================
// ADD REVIEW
// =======================
exports.addReview = async (req, res) => {
  const userId = req.user.user_id;
  const { film_id, review_text, title, poster_path } = req.body;

  try {
    // 1. pastikan film ada di tabel films
    const [films] = await pool.query(
      'SELECT film_id FROM films WHERE film_id = ?',
      [film_id]
    );

    if (films.length === 0) {
      await pool.query(
        `INSERT INTO films (film_id, title, poster)
         VALUES (?, ?, ?)`,
        [film_id, title, poster_path]
      );
    }

    // 2. insert review
    await pool.query(
      `INSERT INTO reviews (user_id, film_id, review_text)
       VALUES (?, ?, ?)`,
      [userId, film_id, review_text]
    );

    res.status(201).json({ message: 'Review added successfully' });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// =======================
// GET REVIEWS BY FILM
// =======================
exports.getReviewsByFilm = async (req, res) => {
  const { film_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        r.review_id,
        r.review_text,
        r.created_at,
        u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.film_id = ?
       ORDER BY r.created_at DESC`,
      [film_id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// =======================
// DELETE REVIEW
// =======================
exports.deleteReview = async (req, res) => {
  const userId = req.user.user_id;
  const reviewId = req.params.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM reviews WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: 'Not allowed or review not found'
      });
    }

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete review',
      error: error.message
    });
  }
};
