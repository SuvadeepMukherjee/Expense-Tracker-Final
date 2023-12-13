//importing required modules
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

/*
loads and configures environment variables from a .env file
 into the Node.js application using the 'dotenv' package.
 */
dotenv.config();

//importing sequelize and models
const sequelize = require("./util/database");
const User = require("./models/userModel");
const ResetPassword = require("./models/resetPasswordModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/ordersModel");
const UrlDownloads = require("./models/urlModel");

//creating an express application
const app = express();

/*
 Enable Cross-Origin Resource Sharing (CORS) to accept requests from 
 domains other than its own.
 */
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse incoming URL-encoded data and make it available in req.body
// Parse incoming JSON data and make it available in req.body
// When extended is set to false, body-parser parses URL-encoded data using the classic syntax,
// resulting in req.body containing string or array values, not allowing parsing of complex objects.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//importing routers
const userRouter = require("./router/userRouter");
const resetPasswordRouter = require("./router/resetPasswordRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseMembershipRouter = require("./router/purchaseMembershipRouter");
const leaderboardRouter = require("./router/leaderboardRouter");
const reportsRouter = require("./router/reportsRouter");

//importing routers for specific paths
app.use("/", userRouter);
app.use("/user", userRouter);
app.use("/password", resetPasswordRouter);
app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);
app.use("/purchase", purchaseMembershipRouter);
app.use("/premium", leaderboardRouter);
app.use("/reports", reportsRouter);

// Defining associations between models to establish relationships.
// Each association creates a foreign key in the target model referencing the associated model.
// For example, User.hasMany(Expense) creates a foreign key 'UserId' in the Expense model,
// linking each expense to a specific user
// Both associations are needed for a bidirectional relationship,
// allowing navigation from User to Expense and vice versa.
// Establishing bidirectional relationships for data integrity and query convenience
User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ResetPassword);
ResetPassword.belongsTo(User);
User.hasMany(UrlDownloads);
UrlDownloads.belongsTo(User);

// Syncing Sequelize with the database and starting the server
sequelize.sync().then((result) => {
  app.listen(3000);
});
