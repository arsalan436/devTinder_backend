const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/database");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const initializeSocket = require("./utils/socket");

const port = process.env.PORT;

// Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/Chat");

// CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieparser());

// Mount all routers at /api
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", chatRouter);

// Health check
app.get("/api", (req, res) => {
  res.send("API is up and running!");
});

// Connect DB and start server
connectDB()
  .then(() => {
    console.log("connected to the database successfully");

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`server is successfully listening on port: ${port}`);
    });

    // Attach socket to this same server
    initializeSocket(server);
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("database is not connected", err.message);
    }
  });
