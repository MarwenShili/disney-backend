const express = require("express");
const userRouter = require("./routes/userRoutes");
const comdRouter = require("./routes/commandeRoutes");

const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", comdRouter);

// url not found
// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`));
// });

module.exports = app;
