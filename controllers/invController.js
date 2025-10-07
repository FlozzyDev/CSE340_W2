const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.buildByItemId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getItemById(inv_id);
  const detail = await utilities.buildItemDetail(data);
  let nav = await utilities.getNav();
  const title =
    data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model;
  res.render("./inventory/detail", {
    title: title,
    nav,
    detail,
  });
};

// The control to trigger the error page
invCont.triggerError = async function (req, res, next) {
  const error = new Error("This is a successful error! Good job I guess?");
  error.status = 500;
  throw error;
};

module.exports = invCont;
