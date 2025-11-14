express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

router.get("/", utilities.handleErrors(accountController.buildAccountPage));

router.get("/login", utilities.handleErrors(accountController.buildLoginPage));

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegistrationPage)
);
// Registration route
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt for testing
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;
