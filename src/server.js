// require("dotenv").config();
// require("./helpers/loadenv");
// const Express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const logger = require("morgan");
// const databaseHelper = require("./helpers/database");
// const errorFormatter = require("./helpers/errors/formatter");
// const loginRoute = require("./routes/login");
// const protectRoute = require("./routes/protect");
// const { auth } = require("./middlewares/authentic");

// const app = Express();
// // .get("/db", async (req, res) => {
// //   try {
// //     const client = await pool.connect();
// //     const result = await client.query("SELECT * FROM test_table");
// //     const results = { results: result ? result.rows : null };
// //     res.render("pages/db", results);
// //     client.release();
// //   } catch (err) {
// //     console.error(err);
// //     res.send(`Error ${err}`);
// //   }
// // });

// /** MIDDLEWARES */
// app.use(logger("dev"));
// app.use(cors());
// app.use(Express.static("public"));
// app.use(bodyParser.json());

// app.use("/oapi", loginRoute);
// app.use("/api", auth, protectRoute);

// /* error handlers */
// app.use((err, req, res, next) => {
//   //eslint-disable-line

//   /* eslint-disable no-console */
//   console.error(err.stack || err);
//   console.error(JSON.stringify(err));
//   const formattedError = errorFormatter(err);

//   res.status(formattedError.status || 500);
//   res.json(formattedError);
// });

// databaseHelper.isDatabaseConnected().then(() => {
//   const { PORT } = process.env;

//   app.listen(PORT, () => {
//     console.log(`Server is running on ${PORT}`);
//   });
// });

const express = require("express");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

const app = express();

const PORT = process.env.PORT || 8080;

// const connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: 'rooty',
//   databade: 'testing1'
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

client.connect(error => {
  console.log("connected to db");
  app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
  });
});

app.get("/api/all", (req, res) => {
  client.query("SELECT * FROM test1", (error, result) => {
    res.json(result);
  });
});
