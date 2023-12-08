const path = require("path");

const rootDir = require("../util/path");

exports.forgotPasswordPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "forgotPassword.html"));
};
