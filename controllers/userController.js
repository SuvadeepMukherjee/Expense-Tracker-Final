const path = require("path");

const rootDir = require("../util/path");

exports.getSignUpPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "sign-up.html"));
};
