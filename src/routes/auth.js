const express = require("express");
const authRouter = express.Router();
const{validateSignUpData} = require("../utils/validation")
const User = require("../models/user");
const bcrypt = require("bcrypt")
// local should be without /api 
authRouter.post("/api/signup", async (req, res) => {
  // dynamic to recieve data from end user (here postman)

  try {
        const userCount = await User.countDocuments();
    if (userCount >= 500) {
      return res.status(403).json({ message: "Signup limit reached. No more registrations allowed." });
    }
    // validate signup data
    validateSignUpData(req);
    // encryption of password
    const { firstName, lastName, emailId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();
 
    res.cookie("token",token,{maxAge:3600000*24*7})

    res.json({message:"user added successfully!",data:savedUser});
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/api/login", async (req, res) => {
  try {
    const { emailId, password} = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else {

      const token = await user.getJWT();
 
      res.cookie("token",token,{maxAge:3600000*24*7})
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/api/logout", async (req,res)=>{
    res.cookie("token", null, {maxAge:0})
    res.send("LogOut successfully!");
})

module.exports = authRouter;