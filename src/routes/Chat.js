const express = require("express");
const chatRouter = express.Router();
const {userAuth} = require("../middlewares/UserAuth");
const Chat = require("../models/Chats");
const { model } = require("mongoose");


chatRouter.get("/chat/:userId/:targetUserId",userAuth,async(req,res)=>{

    try{
            const {userId,targetUserId} = req.params;
            const chats  = await Chat.find({
            $or:[
                    {userId,targetUserId},
                    {userId:targetUserId,targetUserId:userId}
            ]
            }).sort({ createdAt: 1 });

                res.json(chats);

    }
    catch(err){
            if (process.env.NODE_ENV !== "production") {
                console.error("Error fetching chats:", err.message);
            }
            
            res.status(500).send("Server Error");
    }

})

module.exports = chatRouter