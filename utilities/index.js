const e = require("express");
const invModel = require("../models/inventory-model");
const Util = {};

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
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li id='inv-display-item'>";
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
      grid += "<hr id='details-divider' >";
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
    detail = '<div id="container-item-details">';
    detail += '<div id="item-details-image">';
    detail +=
      '<img src="' +
      data[0].inv_image +
      '" alt="Image of ' +
      data[0].inv_make +
      " " +
      data[0].inv_model +
      ' on CSE Motors" >';
    detail += "<hr id='details-divider' >";
    detail += "</div>";
    detail += '<div id="item-details-details">';
    detail += "<ul id='item-details-list'>";
    detail +=
      "<li id='item-detail-price'><span class='item-header'>Price: </span>$" +
      new Intl.NumberFormat("en-US").format(data[0].inv_price) +
      "</li>";
    detail +=
      "<li id='item-detail-desc'><span class='item-header'>Description: </span>" +
      data[0].inv_description +
      "</li>";
    detail +=
      "<li id='item-detail-color'><span class='item-header'>Color: </span>" +
      data[0].inv_color +
      "</li>";
    detail +=
      "<li id='item-detail-year'><span class='item-header'>Year: </span>" +
      data[0].inv_year +
      "</li>";
    detail +=
      "<li id='item-detail-miles'><span class='item-header'>Miles: </span>" +
      new Intl.NumberFormat("en-US").format(data[0].inv_miles) +
      "</li>";
    detail += "</ul>";
    detail += "</div>";
    detail += "</div>";
    return detail;
  }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
