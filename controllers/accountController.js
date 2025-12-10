const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const favoriteModel = require("../models/favorite-model");
const invModel = require("../models/inventory-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLoginPage(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegistrationPage(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/registration", {
    title: "Registration",
    nav,
    errors: null,
  });
}

async function buildAccountPage(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account Information",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    console.log(
      `Registration successful - ${account_firstname} ${account_lastname} ${account_email}`
    );
    req.flash(
      "notice-form-success",
      `Congratulations, you are now registered, ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    console.log(
      `Registration failed - ${account_firstname} ${account_lastname} ${account_email}`
    );
    req.flash("notice-form-failed", "Sorry, the registration failed.");
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}
// Logout function
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

// Build update view
async function buildUpdateAccountPage(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);

  // check the user ID to make sure it matches logged in user
  if (res.locals.accountData.account_id !== account_id) {
    req.flash("notice", "You can only update your own account.");
    return res.redirect("/account/");
  }

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: res.locals.accountData.account_id,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email,
  });
}

// update account, same as register
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    parseInt(account_id)
  );

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.");
    const accountData = await accountModel.getAccountById(account_id);
    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000,
    });
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });
    }
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }
}

async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  const accountData = await accountModel.getAccountById(account_id);
  const checkPassword = await bcrypt.compare(
    account_password,
    accountData.account_password
  );
  // want to verify the password is different from the current
  if (checkPassword) {
    req.flash(
      "notice",
      "You have used that password already... Pick something fresh!"
    );
    return res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password.");
    const accountData = await accountModel.getAccountById(account_id);
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  }

  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    parseInt(account_id)
  );

  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
  } else {
    req.flash("notice", "Sorry, the password update failed.");
  }
  res.redirect("/account/");
}

// new view for favroite vehicle list
async function buildFavoritesPage(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = res.locals.accountData.account_id;

  const favorites = await favoriteModel.getFavorites(account_id);
  const favoriteIds = favorites.map((favorite) => favorite.inv_id);
  if (favoriteIds.length === 0) {
    const grid = "<p>You have no favorite vehicles.</p>";
    res.render("account/favorites", {
      title: "Favorite Vehicles",
      nav,
      grid,
      errors: null,
    });
  } else {
    const vehicles = await invModel.getInventoryByIds(favoriteIds);
    const grid = await utilities.buildClassificationGrid(vehicles, favoriteIds);
    res.render("account/favorites", {
      title: "Favorite Vehicles",
      nav,
      grid,
      errors: null,
    });
  }
}

module.exports = {
  buildLoginPage,
  buildRegistrationPage,
  buildAccountPage,
  registerAccount,
  accountLogin,
  accountLogout,
  buildUpdateAccountPage,
  updateAccount,
  updatePassword,
  buildFavoritesPage,
};
