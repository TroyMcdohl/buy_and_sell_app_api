const express = require("express");
const app = express();
const authRouter = require("./routes/authRouter");
const productRouter = require("./routes/productRouter");
const categoryRouter = require("./routes/categoryRouter");
const { default: mongoose } = require("mongoose");
const AppError = require("./error/AppError");
const globalErrorHandler = require("./error/GlobalErrorHandler");
const cookieParser = require("cookie-parser");
require("dotenv").config({});
const cors = require("cors");
const path = require("path");

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mrwvd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("DB connected.");
  })
  .catch((err) => console.log(err));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.set("views", path.join("./views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(
  "/public/img/users",
  express.static(path.join(__dirname, "public", "img", "users"))
);

app.use(
  "/public/img/product",
  express.static(path.join(__dirname, "public", "img", "product"))
);

app.use(
  "/public/img/nrc",
  express.static(path.join(__dirname, "public", "img", "nrc"))
);

app.use("/api/v1/users", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/category", categoryRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`The path you find ${req.baseUrl} not found.`, 404));
});

app.use(globalErrorHandler);

app.listen(8000, () => {
  console.log("Server is running");
});
