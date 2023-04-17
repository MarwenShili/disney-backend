const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./app");

//CONNECT DATABASE
const DB = process.env.DATABASE; //.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Db Connection successfuly ");
  });

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
