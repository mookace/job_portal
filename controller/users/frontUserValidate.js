const { check, validationResult } = require("express-validator");

// Sanitizer Code
exports.SanitizeRegister = [
  check("email").trim(),
  check("password").trim(),
  (req, res, next) => {
    next();
  },
];

exports.UpdateProfileSanitizer = [
  check("fullname").trim(),
  check("cv").trim(),
  (req, res, next) => {
    next();
  },
];

exports.ChangePasswordSanitizer = [
  check("oldPassword").trim(),
  check("newPassword").trim(),
  check("confirmNewPassword").trim(),
  (req, res, next) => {
    next();
  },
];

// Validation Code

exports.Registervalidate = [
  check("email", "Invalid Email").isEmail(),
  check("password", "Password must be 8 Character or longer").isLength({
    min: 8,
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("Errmsg", errors.array()[0].msg);
      res.render("register", { Errmsg: req.flash("Errmsg") });
    } else {
      next();
    }
  },
];

exports.ChangePasswordValidate = [
  check("newPassword", "New Password must be 8 Character or longer").isLength({
    min: 8,
  }),
  check(
    "confirmNewPassword",
    "Confirm Password must be 8 Character or longer"
  ).isLength({
    min: 8,
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("Errmsg", errors.array()[0].msg);
      res.redirect("/front/changePassword?userid=" + req.query.updateid);
    } else {
      next();
    }
  },
];
