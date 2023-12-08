const path = require("path");

const { v4: uuidv4 } = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const rootDir = require("../util/path");

const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.forgotPasswordPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "forgotPassword.html"));
};

exports.resetPasswordPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "resetPassword.html"));
};

exports.sendMail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const requestId = uuidv4();

    const recepientEmail = await User.findOne({ where: { email: email } });
    console.log(recepientEmail);
    const userId = recepientEmail.dataValues.id;
    console.log(userId);

    if (!recepientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide the registered email!" });
    }

    const resetRequest = await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: userId,
    });

    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    const transEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
      email: "suvadeepworks@gmail.com",
      name: "Suvadeep",
    };
    const receivers = [
      {
        email: email,
      },
    ];

    const emailResponse = await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "link Below",
      htmlContent: `<h3>Hi! We got the request from you for reset the password. Here is the link below >>></h3>
      <a href="http://localhost:3000/password/resetPasswordPage/{{params.requestId}}"> Click Here</a>`,
      params: {
        requestId: requestId,
      },
    });
    return res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (err) {
    return res.status(409).json({ message: "failed changing password" });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const requestId = req.headers.referer.split("/");
    console.log("requestId", requestId);
    const password = req.body.password;
    console.log("password is ", password);
    const checkResetRequest = await ResetPassword.findAll({
      where: { id: requestId[requestId.length - 1], isActive: true },
    });
    console.log("checkResetRequest", checkResetRequest);
    console.log("------");
    console.log("the object", checkResetRequest[0]);
    if (checkResetRequest[0]) {
      const userId = checkResetRequest[0].dataValues;
      console.log("------");
      console.log("userId is ", userId);
      console.log("--------");
      const result = ResetPassword.update(
        { isActive: false },
        { where: { id: requestId } }
      );
      console.log("succesfully found in  database");

      const newPassword = await hashPassword(password);
      console.log("hashed password is ", newPassword);
      const user = await User.update(
        { password: newPassword },
        { where: { id: userId.userId } }
      );
      console.log("succesfully updated password in database");
      return res.status(200).json({ message: "Succesfully changed password" });
    } else {
      res.status(409).json({ message: "Failed to change password!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(409).json({ message: "Failed to change password!" });
  }
};
