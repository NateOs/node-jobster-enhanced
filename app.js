require("dotenv").config();
require("express-async-errors");

// extra security packages
const xss = require("xss-clean"); // sanitizes user POST, GET queries


const express = require("express");
const app = express();

// routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");


app.use(express.json());
app.use(xss());

app.use(express.json());

const connectDB = require("./db/connect");

const authenticateUser = require("./middleware/authentication");

// extra packages

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

const port = process.env.PORT || 3000;

// start server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

start();
