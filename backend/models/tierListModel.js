const db = require('../config/db');

const createTierList = async (user_id, title, description) => {
    const [result] = await db.query(
        `INSERT INTO tier_lists (user_id, title, description, created_at)
        VALUES (?, ?, ?, NOW())`,
        [user_id, title, description]
    );
    return result.insertId;
};

const getTierListsByUser = async (user_id) => {
    const [rows] = await db.query(
        `SELECT * FROM tier_lists WHERE user_id = ? ORDER BY created_at DESC`,
        [user_id]
    );
    return rows;
};

const getTierListById = async (tier_list_id) => {
    const [tierListRows] = await db.query(
        `SELECT * FROM tier_lists WHERE tier_list_id = ?`,
        [tier_list_id]
    );
    if (!tierListRows.length) return null;

    const [films] = await db.query(
        `SELECT f.*, t.position
        FROM tier_list_films t
        JOIN films f ON t.film_id = f.film_id
        WHERE t.tier_list_id = ?
        ORDER BY t.position ASC`,
        [tier_list_id]
    );

    return { ...tierListRows[0], films };
};

const addFilmToTierList = async (tier_list_id, film_id, position) => {
    const [result] = await db.query(
        `INSERT INTO tier_list_films (tier_list_id, film_id, position, created_at)
        VALUES (?, ?, ?, NOW())`,
        [tier_list_id, film_id, position]
    );
    return result.insertId;
};

const updateTierListFilmOrder = async (tier_list_id, filmPositions) => {
    const promises = filmPositions.map(fp => {
        return db.query(
            `UPDATE tier_list_films
            SET position = ?
            WHERE tier_list_id = ? AND film_id = ?`,
            [fp.position, tier_list_id, fp.film_id]
        );
    });

    await Promise.all(promises);
    return true;
};

const deleteTierList = async (tier_list_id) => {
    await db.query(
        `DELETE FROM tier_list_films WHERE tier_list_id = ?`,
        [tier_list_id]
    );

    const [result] = await db.query(
        `DELETE FROM tier_lists WHERE tier_list_id = ?`,
        [tier_list_id]
    );

    return result.affectedRows; 
};

const deleteFilmFromTierList = async (tier_list_id, film_id) => {
    const [result] = await db.query(
        `DELETE FROM tier_list_films WHERE tier_list_id = ? AND film_id = ?`,
        [tier_list_id, film_id]
    );
    return result.affectedRows; 
};

module.exports = {createTierList, getTierListsByUser,getTierListById,addFilmToTierList, updateTierListFilmOrder, deleteTierList, deleteFilmFromTierList};