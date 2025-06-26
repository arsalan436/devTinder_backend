const express = require("express");
const app = express();
require("./config/database");
const connectDB = require("./config/database");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const port = process.env.PORT;
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

const server  = http.createServer(app);
initializeSocket(server);

// Optional: simple health check route
app.get("/api", (req, res) => {
  res.send("API is up and running!");
});

connectDB()
  .then(() => {
    console.log("connected to the database successfully");

    // a big change here used app instead of server so take care
    app.listen(port, () => {
      console.log(`server is successfully listening on port: ${port}`);
    });
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== "production") {
  console.error("database is not connected", err.message);
}
  });
