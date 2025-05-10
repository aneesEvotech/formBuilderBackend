const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const apiroute = require("./apiroute");
const authroute = require("./authapiroute");
const responseroute = require("./responseroute");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  cors({
    origin: "https://formbuilderevotechfrontend.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/forms", apiroute);
app.use("/api/responses", responseroute);
app.use("/auth/api", authroute);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("database is connected.");
    app.listen(process.env.PORT, () => {
      console.log("server is running on port number 3001");
    });
  })
  .catch((error) => {
    console.log("database is not connected", error);
  });
