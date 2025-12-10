const pool = require("../database");

// for details we just need one
async function getFavorite(inv_id, account_id) {
  try {
    const sql = "SELECT * FROM favorites WHERE inv_id = $1 AND account_id = $2";
    const result = await pool.query(sql, [inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    return error.message;
  }
}
// need array for list views
async function getFavorites(account_id) {
  try {
    const sql = "SELECT * FROM favorites WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    return error.message;
  }
}

async function addFavorite(inv_id, account_id) {
  try {
    const sql =
      "INSERT INTO favorites (inv_id, account_id) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(sql, [inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    return error.message;
  }
}

async function deleteFavorite(inv_id, account_id) {
  try {
    const sql =
      "DELETE FROM favorites WHERE inv_id = $1 AND account_id = $2 RETURNING *";
    const result = await pool.query(sql, [inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    return error.message;
  }
}

module.exports = {
  getFavorite,
  getFavorites,
  addFavorite,
  deleteFavorite,
};
