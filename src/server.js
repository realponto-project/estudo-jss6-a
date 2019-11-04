require("dotenv").config();
require("./helpers/loadenv");
const webpush = require("web-push");
const Express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("morgan");
const databaseHelper = require("./helpers/database");
const errorFormatter = require("./helpers/errors/formatter");
const loginRoute = require("./routes/login");
const protectRoute = require("./routes/protect");
const { auth } = require("./middlewares/authentic");

const app = Express();

/** MIDDLEWARES */
app.use(logger("dev"));
app.use(cors());
app.use(Express.static("client"));
// app.use(Express.static("public"));
app.use(bodyParser.json());
app.use("/oapi", loginRoute);
app.use("/api", auth, protectRoute);

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto:teste@test.com",
  publicVapidKey,
  privateVapidKey
);

app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  // console.log(req);

  res.status(201).json({});

  const payload = JSON.stringify({ title: "Push Test" });

  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.log("sendNotification" + err));
});

/* error handlers */
app.use((err, req, res, next) => {
  //eslint-disable-line

  /* eslint-disable no-console */
  console.error(err.stack || err);
  console.error(JSON.stringify(err));
  const formattedError = errorFormatter(err);

  res.status(formattedError.status || 500);
  res.json(formattedError);
});

// app.post("push-not", (req, res) => {});

databaseHelper.isDatabaseConnected().then(() => {
  const { PORT } = process.env;

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
});
