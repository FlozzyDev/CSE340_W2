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

// Update account view, similar to registration form
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountPage)
);

// check they are logged in, and they are trying to update their own account
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountId,
  regValidate.updateAccountRules(),
  regValidate.checkAccountData,
  utilities.handleErrors(accountController.updateAccount)
);

// Same as above but for password
router.post(
  "/update-password",
  utilities.checkLogin,
  utilities.checkAccountId,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// super simple - clear cookie and redirect to homepage
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;
