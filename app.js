const express = require("express");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1/users", userRouter);

// url not found
// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`));
// });

module.exports = app;
