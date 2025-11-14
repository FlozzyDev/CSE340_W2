const pool = require("../database/");

async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

// using almost the exact same code from account to check we don't already have the classification name
async function checkExistingClassification(classification_name) {
  try {
    console.log("(model) checking classification", classification_name);
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const classification = await pool.query(sql, [classification_name]);
    console.log("(model) classification exists", classification.rowCount);
    return classification.rowCount;
  } catch (error) {
    console.log("(model) error checking classification", error);
    return error.message;
  }
}

// our post to add the classification
async function addClassification(classification_name) {
  try {
    console.log("(model) adding classification", classification_name);
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("(model) addClassification error " + error);
  }
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

// so we take all items from the form, append the placeholder images, and then insert.
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  console.log(
    "(model) adding inventory",
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );
  let inv_image = "/images/vehicles/no-image.png";
  let inv_thumbnail = "/images/vehicles/no-image-tn.png";
  try {
    const sql =
      "INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_image, inv_thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";
    return await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail,
    ]);
  } catch (error) {
    console.error("addInventory error " + error);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    console.log("(model) updating `" + inv_make + " " + inv_model + "`");
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getItemById,
  checkExistingClassification,
  addClassification,
  addInventory,
  updateInventory,
};
