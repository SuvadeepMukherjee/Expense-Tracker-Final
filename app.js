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
const sequelize = require("./util/database");

app.use("/", userRouter);
app.use("/user", userRouter);

sequelize.sync().then((result) => {
  app.listen(3000);
});
