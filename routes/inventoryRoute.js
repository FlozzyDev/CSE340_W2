const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");

router.get(
  "/type/:classificationId",
  handleErrors(invController.buildByClassificationId)
);
router.get("/detail/:invId", handleErrors(invController.buildByItemId));
// a route specific to cause a trigger for assignment (but also good for error page design testing)
router.get("/triggerError", handleErrors(invController.triggerError));

module.exports = router;
