const path = require("path");

const { v4: uuidv4 } = require("uuid");
const Sib = require("sib-api-v3-sdk");

const rootDir = require("../util/path");

const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");

exports.forgotPasswordPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "forgotPassword.html"));
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
