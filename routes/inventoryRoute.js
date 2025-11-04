const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Manager view - it says /inv but I assumed that was to start the route, not actually just be literal "/inv"
router.get("/management", handleErrors(invController.buildManagement));

// Building/displaying the forms
router.get(
  "/management/addClassification",
  handleErrors(invController.buildAddClassificationPage)
);
router.get(
  "/management/addInventory",
  handleErrors(invController.buildAddInventoryPage)
);

// the posts to send the data, pass through validation first (like with account)
router.post(
  "/management/newClassification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  handleErrors(invController.addClassification)
);
router.post(
  "/management/newInventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  handleErrors(invController.addInventory)
);

router.get(
  "/type/:classificationId",
  handleErrors(invController.buildByClassificationId)
);
router.get("/detail/:invId", handleErrors(invController.buildByItemId));
// a route specific to cause a trigger for assignment (but also good for error page design testing)
router.get("/triggerError", handleErrors(invController.triggerError));

module.exports = router;
