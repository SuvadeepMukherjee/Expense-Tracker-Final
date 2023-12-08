/*
This middleware (authenticate) checks for a valid JWT in the "Authorization" header. 
If the token is valid, it retrieves the corresponding user from the database and attaches it to the request
 (req.user). If any error occurs, it logs the error and sends a 401 Unauthorized response with { success: false }.
*/

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    const user = jwt.verify(token, process.env.TOKEN);
    console.log(user);
    User.findByPk(user.userId).then((user) => {
      req.user = user;
      next();
    });
  } catch (err) {
    console.log("Error in authentication middleware", err);
    return res.status(401).json({ success: false });
  }
};

module.exports = authenticate;
