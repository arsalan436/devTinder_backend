const express = require("express");
const app = express();
require("./config/database");
const connectDB = require("./config/database");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
// ses things



// Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/Chat")

// CORS setup
app.use(cors({
  origin: "http://localhost:5173",
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

const server  = http.createServer(app);
initializeSocket(server);

// Optional: simple health check route
app.get("/api", (req, res) => {
  res.send("API is up and running!");
});

connectDB()
  .then(() => {
    console.log("connected to the database successfully");

    server.listen(3000, () => {
      console.log("server is successfully listening on port:3000");
    });
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== "production") {
  console.error("database is not connected", err.message);
}
  });
