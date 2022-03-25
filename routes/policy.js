var express = require("express");
var router = express.Router();
var { emailEncode, emailDecode } = require("../bin/encodeDecode");

/* GET home page. */
router.get("/:policyType", function (req, res, next) {
  try {
    let isLogged = req.isAuthenticated();
    let loggedInUser = req.user;
    let typeOfPolicy = req.params.policyType;

    res.render("policy", {
      isLogged,
      loggedInUser,
      emailEncode,
      typeOfPolicy,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
