const favoriteModel = require("../models/favorite-model");

const favoriteCont = {};

favoriteCont.addFavorite = async function (req, res, next) {
  const { inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;
  const addResult = await favoriteModel.addFavorite(inv_id, account_id);
  if (addResult) {
    req.flash(
      "notice-form-success",
      "You have added this vehicle to your favorites"
    );
    res.redirect(req.get("Referer") || `/inv/detail/${inv_id}`);
  } else {
    req.flash("notice-form-failed", "Favorite failed to add");
    res.redirect(req.get("Referer") || `/inv/detail/${inv_id}`);
  }
};

favoriteCont.deleteFavorite = async function (req, res, next) {
  const { inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;
  const deleteResult = await favoriteModel.deleteFavorite(inv_id, account_id);
  if (deleteResult) {
    req.flash(
      "notice-form-success",
      "You have deleted this vehicle from your favorites"
    );
    res.redirect(req.get("Referer") || `/inv/detail/${inv_id}`);
  } else {
    req.flash("notice-form-failed", "Favorite failed to delete");
    res.redirect(req.get("Referer") || `/inv/detail/${inv_id}`);
  }
};

module.exports = favoriteCont;
