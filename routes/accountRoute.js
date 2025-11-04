express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

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
  (req, res) => {
    res
      .status(200)
      .send(
        "login process successful (you got through validation) we should actually make a page here..."
      );
  }
);

module.exports = router;
