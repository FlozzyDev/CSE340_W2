const pool = require("../database/");

async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification AS c 
      LEFT JOIN public.inventory AS i 
      ON i.classification_id = c.classification_id 
      WHERE c.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

async function getItemById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i WHERE i.inv_id = $1`,
      [inv_id]
    );
    console.log(data.rows);
    return data.rows;
  } catch (error) {
    console.error("getInventoryById error " + error);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getItemById,
};
