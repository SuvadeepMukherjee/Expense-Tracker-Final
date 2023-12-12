const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/*
This middleware (authenticate) checks for a valid JWT in the "Authorization" header. 
If the token is valid, it retrieves the corresponding user from the database and attaches it to the request
 (req.user). If any error occurs, it logs the error and sends a 401 Unauthorized response with { success: false }.
when we generate the token we are encoding in this format 
{
  "userId": 9,
  "email": "helal@zohomail.in",
  "iat": 1702366097
}
*/
const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    const user = jwt.verify(token, process.env.TOKEN);
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
