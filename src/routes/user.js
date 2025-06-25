const express = require("express");
const { userAuth } = require("../middlewares/UserAuth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "skills",
  "about",
];
// local should be without /api

userRouter.get("/user/request/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "data fetched successfully!",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
      status: "accepted",
    })
      .populate("toUserId", USER_SAFE_DATA)
      .populate("fromUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((elem) => {
      if (elem.fromUserId._id.equals(loggedInUser._id)) {
        return elem.toUserId;
      } else {
        return elem.fromUserId;
      }
    });

    res.json({
      message: "data fetched successfully!",
      data: data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page  = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit  = (limit>50)?(50):(limit);
    const skip = (page-1)*limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersfromfeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersfromfeed.add(req.fromUserId.toString());
      hideUsersfromfeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersfromfeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_SAFE_DATA).limit(limit).skip(skip);

    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
userRouter.get("/user/:userId",userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(USER_SAFE_DATA); // exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error!" });
  }
});


module.exports = userRouter;
