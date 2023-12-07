const path = require("path");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rootDir = require("../util/path");
const User = require("../models/userModel");

function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.TOKEN);
}

exports.getSignUpPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "sign-up.html"));
};

exports.getLoginPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

exports.postUserSignUp = async (req, res, next) => {
  try {
    const name = req.body.nameValue;
    const email = req.body.emailValue;
    const password = req.body.passwordValue;

    await User.findOne({ where: { email: email } })
      .then((user) => {
        if (user) {
          res.status(409).json({
            error: "This email is already taken .Please choose another one",
          });
        } else {
          bcrypt.hash(password, 10, async (err, hash) => {
            await User.create({
              name: name,
              email: email,
              password: hash,
            });
          });
          res.status(200).json({
            success: true,
            message: "Login Successful!",
          });
        }
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
};

exports.postUserLogin = async (req, res, next) => {
  try {
    console.log(req.body);
    const email = req.body.emailValue;
    const password = req.body.passwordValue;

    await User.findOne({ where: { email: email } }).then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went Wrong!" });
          }
          if (result == true) {
            return res.status(200).json({
              success: true,
              message: "Login Successful!",
              token: generateAccessToken(user.id, user.email),
            });
          } else {
            return res.status(401).json({
              success: false,
              message: "Password Incorrect!",
            });
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User doesn't Exists!",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
