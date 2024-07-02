const express = require("express");
const app = express();
const database = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// import routes
const userRoutes = require("./routes/User");
const referalRoutes = require("./routes/Refer");
const paymentRoutes = require("./routes/Payment");
const adminRoutes = require("./routes/Admin");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Database connect
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);



// Mount routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/refer", referalRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);

// Default Route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running...",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
