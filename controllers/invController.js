const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const favoritesModel = require("../models/favorite-model");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  let favoriteIds = []; // we need to create an array of all IDs to display proper toggle
  if (res.locals.loggedin) {
    const account_id = res.locals.accountData.account_id;
    const favorites = await favoritesModel.getFavorites(account_id);
    favoriteIds = favorites.map((favorite) => favorite.inv_id);
  }

  const grid = await utilities.buildClassificationGrid(data, favoriteIds);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    favoriteIds, // pass array
    errors: null,
  });
};

invCont.buildByItemId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getItemById(inv_id);

  let isFavorite = false;
  if (res.locals.loggedin) {
    const account_id = res.locals.accountData.account_id;
    const favorite = await favoritesModel.getFavorite(inv_id, account_id);
    isFavorite = favorite ? true : false;
  }
  const detail = await utilities.buildItemDetail(data, isFavorite);
  let nav = await utilities.getNav();
  const title =
    data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model;
  res.render("./inventory/detail", {
    title: title,
    nav,
    detail,
    isFavorite,
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

invCont.buildEditInventoryPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.params.inv_id);
  const inventoryData = await invModel.getItemById(inv_id);
  const classification_id = inventoryData[0].classification_id;
  console.log("(controller) classification_id", classification_id);

  const classificationList = await utilities.buildClassificationList(
    classification_id
  );
  const itemData = inventoryData[0];
  const vehicleName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: `Edit ${vehicleName}`,
    nav,
    classificationList,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
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

invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
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
  );
  if (updateResult) {
    console.log("(controller) Inventory updated successfully");
    req.flash(
      "notice-form-success",
      "Inventory updated successfully - " + inv_make + " " + inv_model
    );
    res.redirect("/inv/management");
  } else {
    console.log("(controller) Inventory failed to update");
    req.flash("notice-form-failed", "Inventory failed to update");
    res.status(501).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationList: await utilities.buildClassificationList(
        classification_id
      ),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      errors: req.flash("notice-form-failed"),
    });
  }
};

invCont.buildDeleteInventoryPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.params.inv_id);
  const inventoryData = await invModel.getItemById(inv_id);
  const itemData = inventoryData[0];
  res.render("./inventory/delete-inventory", {
    title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
    nav,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    errors: null,
  });
};

invCont.deleteInventory = async function (req, res) {
  const { inv_id } = req.body;
  const deleteResult = await invModel.deleteInventoryItem(inv_id);
  if (deleteResult) {
    console.log("(controller) Inventory deleted successfully", inv_id);
    req.flash("notice-form-success", "Inventory deleted successfully");
    res.redirect("/inv/management");
  } else {
    console.log("(controller) Inventory failed to delete", inv_id);
    req.flash("notice-form-failed", "Inventory failed to delete");
    res.status(501).render("inventory/delete-inventory", {
      title: `Delete ${inv_make} ${inv_model}`,
      nav,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      errors: req.flash("notice-form-failed"),
    });
  }
};
/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

// The control to trigger the error page ----------------------------------------------- For assignment, placing on bottom
invCont.triggerError = async function (req, res, next) {
  const error = new Error("This is a successful error! Good job I guess?");
  error.status = 500;
  throw error;
};

module.exports = invCont;
