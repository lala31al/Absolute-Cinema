const db = require('../config/db');

const addWatchlist = async ({ user_id, film_id, title, poster_path }) => {
  const [exists] = await db.query(
    `SELECT watchlist_id FROM watchlist 
    WHERE user_id = ? AND film_id = ?`,
    [user_id, film_id]
  );

  if (exists.length > 0) {
    return null; 
  }

  const [result] = await db.query(
    `INSERT INTO watchlist (user_id, film_id, title, poster_path)
    VALUES (?, ?, ?, ?)`,
    [user_id, film_id, title, poster_path]
  );

  return result.insertId;
};

const getWatchlistByUser = async (user_id) => {
  const [rows] = await db.query(
    `SELECT 
        w.watchlist_id, 
        w.created_at,
        f.title, 
        f.poster,
        f.tmdb_id -- PENTING: Kita butuh ini untuk link href
    FROM watchlist w
    JOIN films f ON w.film_id = f.film_id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC`,
    [user_id]
  );
  return rows;
};

const deleteWatchlist = async (watchlist_id, user_id) => {
  const [result] = await db.query(
    `DELETE FROM watchlist 
    WHERE watchlist_id = ? AND user_id = ?`,
    [watchlist_id, user_id]
  );
  return result.affectedRows;
};

const isInWatchlist = async (user_id, film_id) => {
  const [rows] = await db.query(
    `SELECT watchlist_id FROM watchlist
    WHERE user_id = ? AND film_id = ?`,
    [user_id, film_id]
  );

  return rows[0] || null;
};

module.exports = {
  addWatchlist,
  getWatchlistByUser,
  deleteWatchlist,
  isInWatchlist
};
