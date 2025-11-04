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
    errors: null,
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
    errors: null,
  });
};

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const managementView = await utilities.buildManagementView();
  res.render("./inventory/management", {
    title: "Management View",
    nav,
    managementView,
    errors: null,
  });
};

invCont.buildAddClassificationPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const addResult = await invModel.addClassification(classification_name);

  if (addResult) {
    console.log(
      ` (controller) Classification successful - ${classification_name}`
    );
    req.flash(
      "notice-form-success",
      `Congratulations, you\'ve added a new classification: ${classification_name}.`
    );
    res.status(201).render("inventory/management", {
      title: "Management View",
      nav: await utilities.getNav(),
      managementView: await utilities.buildManagementView(),
      errors: null,
    });
  } else {
    console.log(`Adding classification failed - ${classification_name}`);
    req.flash(
      "notice-form-failed",
      "Sorry, the adding the classification failed."
    );
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: req.flash("notice-form-failed"),
    });
  }
};

invCont.buildAddInventoryPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
  });
};
// Inventory Add ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const addResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (addResult) {
    console.log(
      "(controller) Inventory successful",
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );
    req.flash("notice-form-success", "Inventory added successfully");
    res.status(201).render("inventory/management", {
      title: "Management View",
      nav,
      managementView: await utilities.buildManagementView(),
      errors: null,
    });
  } else {
    console.log(
      "(controller) Inventory failed",
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );
    req.flash("notice-form-failed", "Inventory failed to add");
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(
        classification_id
      ),
      errors: req.flash("notice-form-failed"),
    });
  }
};

// The control to trigger the error page ----------------------------------------------- For assignment, placing on bottom
invCont.triggerError = async function (req, res, next) {
  const error = new Error("This is a successful error! Good job I guess?");
  error.status = 500;
  throw error;
};

module.exports = invCont;
