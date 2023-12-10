const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

/*
 Enable Cross-Origin Resource Sharing (CORS) to accept requests from 
 domains other than its own.
 */
app.use(cors());

/*
loads and configures environment variables from a .env file
 into the Node.js application using the 'dotenv' package.
 */
dotenv.config();

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse incoming URL-encoded data and make it available in req.body
app.use(bodyParser.urlencoded({ extended: false }));

// Parse incoming JSON data and make it available in req.body
app.use(bodyParser.json());

const userRouter = require("./router/userRouter");
const resetPasswordRouter = require("./router/resetPasswordRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseMembershipRouter = require("./router/purchaseMembershipRouter");
const leaderboardRouter = require("./router/leaderboardRouter");
const reportsRouter = require("./router/reportsRouter");
const sequelize = require("./util/database");

const User = require("./models/userModel");
const ResetPassword = require("./models/resetPasswordModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/ordersModel");
const UrlDownloads = require("./models/urlModel");

app.use("/user", userRouter);
app.use("/password", resetPasswordRouter);
app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);
app.use("/purchase", purchaseMembershipRouter);
app.use("/premium", leaderboardRouter);
app.use("/reports", reportsRouter);

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ResetPassword);
ResetPassword.belongsTo(User);
User.hasMany(UrlDownloads);
UrlDownloads.belongsTo(User);

sequelize.sync().then((result) => {
  app.listen(3000);
});
