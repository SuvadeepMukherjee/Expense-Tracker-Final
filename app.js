const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

const dotenv = require("dotenv");
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
const sequelize = require("./util/database");

const User = require("./models/userModel");
const ResetPassword = require("./models/resetPasswordModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/ordersModel");

app.use("/user", userRouter);
app.use("/password", resetPasswordRouter);
app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);
app.use("/purchase", purchaseMembershipRouter);
app.use("/premium", leaderboardRouter);

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
ResetPassword.belongsTo(User);
User.hasMany(ResetPassword);

sequelize.sync().then((result) => {
  app.listen(3000);
});
