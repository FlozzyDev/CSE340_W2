const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities");

// Manager view - it says /inv but I assumed that was to start the route, not actually just be literal "/inv"
// ----------We will check account type for ALL management routes since we need empployee or admin
router.get(
  "/management",
  utilities.checkAccountType,
  handleErrors(invController.buildManagement)
);

// Building/displaying the forms
router.get(
  "/management/addClassification",
  utilities.checkAccountType,
  handleErrors(invController.buildAddClassificationPage)
);
router.get(
  "/management/addInventory",
  utilities.checkAccountType,
  handleErrors(invController.buildAddInventoryPage)
);

// This route creates the same "addInevntoryPage" form but with the data filled in
router.get(
  "/management/edit/:inv_id",
  utilities.checkAccountType,
  handleErrors(invController.buildEditInventoryPage)
);

router.get(
  "/management/delete/:inv_id",
  utilities.checkAccountType,
  handleErrors(invController.buildDeleteInventoryPage)
);

router.post(
  "/management/update",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  handleErrors(invController.updateInventory)
);

router.post(
  "/management/delete",
  utilities.checkAccountType,
  handleErrors(invController.deleteInventory)
);

// the posts to send the data, pass through validation first (like with account)
router.post(
  "/management/newClassification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.checkAccountType,
  handleErrors(invController.addClassification)
);
router.post(
  "/management/newInventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.checkAccountType,
  handleErrors(invController.addInventory)
);

router.get(
  "/management/getInventory/:classification_id",
  utilities.checkAccountType,
  handleErrors(invController.getInventoryJSON)
);

// --------------------- These we do not need to check account type

router.get(
  "/type/:classificationId",
  handleErrors(invController.buildByClassificationId)
);
router.get("/detail/:invId", handleErrors(invController.buildByItemId));
// a route specific to cause a trigger for assignment (but also good for error page design testing)
router.get("/triggerError", handleErrors(invController.triggerError));

module.exports = router;
