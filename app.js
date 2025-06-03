const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const apiroute = require("./apiroute");
const authroute = require("./authapiroute");
const responseroute = require("./responseroute");
const visitorRoute = require("./visitorRoute");
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  // "https://formbuilderevotechfrontend.vercel.app",
  "https://form-builder-frontends.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/forms", apiroute);
app.use("/api/responses", responseroute);
app.use("/auth/api", authroute);
app.use("/api/visitor", visitorRoute);

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Form Builder Backend</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f4f8;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        h1 {
          color: #2c3e50;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Form Builder Backend Server</h1>
    </body>
    </html>
  `);
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("database is connected.");
    app.listen(process.env.PORT, () => {
      console.log("server is running on port number", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("database is not connected", error);
  });
