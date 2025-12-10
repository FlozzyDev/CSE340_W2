express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const favoriteController = require("../controllers/favoriteController");

router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(favoriteController.addFavorite)
);
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.handleErrors(favoriteController.deleteFavorite)
);

module.exports = router;
