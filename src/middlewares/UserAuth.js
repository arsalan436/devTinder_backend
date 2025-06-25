const jwt = require("jsonwebtoken")
const User = require("../models/user")

const userAuth = async (req,res,next)=>{

    try{
            const {token} = req.cookies;
    if(!token){
        return res.status(401).send("please Login!");
    }

    const decodedObj =  jwt.verify(token,process.env.jwt_secret_key);
    const {_id} = decodedObj;
    const user = await User.findById(_id);
    if(!user){
        throw new Error("User not found")
    }

    req.user = user;
    next();
    }
    catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Auth error: ", err.message);
        }
    res.clearCookie("token");
    res.status(401).send("Session expired or invalid token. Please login again.");
  }

}

module.exports = {userAuth};