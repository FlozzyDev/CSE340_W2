const e = require("express");
const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul id='main-nav-items'>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

Util.buildClassificationGrid = async function (data) {
  let grid;
  console.log("data in buildClassificationGrid is: ", data);
  // I was wrong! We want to check if the type doesn't exist, but we do want to return grid and not throw an error if there are simply no vehicles of that type...
  if (!data || data.length === 0) {
    const error = new Error(
      "404: Error fetching that type. Try again. Or don't. Please don't."
    );
    error.status = 404;
    throw error;
  } else if (data.length === 1 && data[0].inv_id === null) {
    // changed query - we always pull classification, and then we display a message if there are no vehicles of that classification (so long as it exists)
    grid =
      "<p id='error-message'> Sorry, we appear to be out of stock of that type. Check back later!</p>";
    return grid;
  } else {
    grid = '<ul class="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li class='inv-display-item'>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'detail"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" ></a>';
      grid += '<div class="namePrice">';
      grid += "<hr class='details-divider' >";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' detail">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
    return grid;
  }
};

Util.buildItemDetail = async function (data) {
  let detail;
  // first we check the return is valid, else 404.
  if (!data || data.length === 0) {
    const error = new Error(
      "404: That item was not found. Are you just trying to cause an accident?"
    );
    error.status = 404;
    throw error;
  } else {
    detail = '<div class="container-item-details">';
    detail += '<div class="item-details-image">';
    detail +=
      '<img src="' +
      data[0].inv_image +
      '" alt="Image of ' +
      data[0].inv_make +
      " " +
      data[0].inv_model +
      ' on CSE Motors" >';
    detail += "<hr class='details-divider' >";
    detail += "</div>";
    detail += '<div class="item-details-details">';
    detail += "<ul class='item-details-list'>";
    detail +=
      "<li class='item-detail-price'><span class='item-header'>Price: </span>$" +
      new Intl.NumberFormat("en-US").format(data[0].inv_price) +
      "</li>";
    detail +=
      "<li class='item-detail-desc'><span class='item-header'>Description: </span>" +
      data[0].inv_description +
      "</li>";
    detail +=
      "<li class='item-detail-color'><span class='item-header'>Color: </span>" +
      data[0].inv_color +
      "</li>";
    detail +=
      "<li class='item-detail-year'><span class='item-header'>Year: </span>" +
      data[0].inv_year +
      "</li>";
    detail +=
      "<li class='item-detail-miles'><span class='item-header'>Miles: </span>" +
      new Intl.NumberFormat("en-US").format(data[0].inv_miles) +
      "</li>";
    detail += "</ul>";
    detail += "</div>";
    detail += "</div>";
    return detail;
  }
};

// Now on week 9 I believe this was done wrong, checking with Brother Shepherd if this is okay or if I need to break it down.
Util.buildManagementView = async function () {
  const classificationSelect = await Util.buildClassificationList();
  let managementView = '<div class="container-management-view">';
  managementView +=
    "<p class='management-view-description'>Manage the classifications and inventory of the dealership.</p>";

  managementView += "<hr class='divider' >";

  managementView += '<div class="management-classification">';
  managementView += "<h2>Classification</h2>";
  managementView +=
    '<a href="/inv/management/addClassification" class="management-add-classification-button">Add Classification +</a>';
  managementView += "</div>";

  managementView += "<hr class='divider' >";

  managementView += '<div class="management-inventory">';
  managementView += "<h2>Inventory</h2>";
  managementView +=
    '<a href="/inv/management/addInventory" class="management-add-inventory-button">Add Inventory +</a>';
  managementView += "</div>";

  managementView += "<hr class='divider' >";

  managementView += "</div>";
  managementView += "<h2>Manage Inventory</h2>";
  managementView += "<p>Select a classification to manage its inventory.</p>";
  managementView += classificationSelect;
  managementView += "<table id='inventoryDisplay'></table>";
  managementView +=
    "<noscript>JavaScript must be enabled to use this page.</noscript></div>";

  return managementView;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
