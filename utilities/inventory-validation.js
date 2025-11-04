const utilities = require(".");
const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const validate = {};

// Classification Validation ---------------------------------------------------------------------------------
// very similar rule set for reg
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(
          classification_name
        );
        console.log(
          "(util validation) classification already exists",
          classificationExists
        );
        if (classificationExists) {
          throw new Error(
            "Classification name exists. Please use a different name"
          );
        }
      }),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  console.log("(util validation) errors", errors);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

// Inventory Validation ---------------------------------------------------------------------------------
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isLength({ min: 1 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be letters and numbers only`
      ),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isLength({ min: 1 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be letters and numbers only`
      ),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be a valid year between 1900 and ${
            new Date().getFullYear() + 1
          }`
      ),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isLength({ min: 6, max: 200 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be between 6 and 200 characters`
      ),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isInt({ min: 0 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be a positive number`
      ),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isInt({ min: 0 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be a positive number`
      ),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isLength({ min: 1 })
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: must be letters only`
      ),

    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        (value, { path }) => `Invalid value for ${path}: field is required`
      )
      .isInt({ min: 1 })
      .withMessage(
        (value, { path }) =>
          `Invalid value for ${path}: must be a valid classification`
      ),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
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
  let errors = [];
  errors = validationResult(req);
  console.log("(util validation) errors", errors);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Inventory",
      classificationList,
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
    return;
  }
  next();
};

module.exports = validate;
