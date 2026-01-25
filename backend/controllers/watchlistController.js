const pool = require('../config/db');

exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      'SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get watchlist',
      error: error.message
    });
  }
};


exports.addToWatchlist = async (req, res) => {
  const userId = req.user.user_id;
  const { film_id, title, poster_path } = req.body;

  try {
    // 1. cek film di tabel films
    const [films] = await pool.query(
      'SELECT film_id FROM films WHERE film_id = ?',
      [film_id]
    );

    // 2. kalau belum ada → insert film
    if (films.length === 0) {
      await pool.query(
        `INSERT INTO films (film_id, title, poster)
         VALUES (?, ?, ?)`,
        [film_id, title, poster_path]
      );
    }

    // 3. insert ke watchlist
    await pool.query(
      `INSERT INTO watchlist (user_id, film_id, title, poster_path)
       VALUES (?, ?, ?, ?)`,
      [userId, film_id, title, poster_path]
    );

    res.json({ message: 'Added to watchlist' });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to add to watchlist',
      error: error.message
    });
  }
};


exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const watchlistId = req.params.id;

    await pool.query(
      'DELETE FROM watchlist WHERE id = ? AND user_id = ?',
      [watchlistId, userId]
    );

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove watchlist',
      error: error.message
    });
  }
};
