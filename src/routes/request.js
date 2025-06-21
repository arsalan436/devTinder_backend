const express = require("express");
const requestRouter = express.Router();
const{userAuth} = require("../middlewares/UserAuth")
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user")
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = require("../utils/ses");



requestRouter.post("/request/send/:status/:toUserId" ,userAuth,async (req,res)=>{

  try{
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;



    const allowedStatus = ["ignored","interested"];
    if(!allowedStatus.includes(status)){
        return res.status(400).send(`Invalid status type ${status}`)
    }

    //  logic below is written in schema level use pre !
    //   if(fromUserId == toUserId){
    //   throw new Error("You cannot send request to yourself!")
    // }

    const toUser = await User.findById(toUserId);
    if(!toUser){
      throw new Error("User not found!")
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or:[
        {fromUserId,toUserId},
        {fromUserId:toUserId,toUserId:fromUserId}
      ]
    })

    if(existingConnectionRequest){
      throw new Error("Connection request already exits!");
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status
    })

    const data = await connectionRequest.save();


    // ses 



  const params = {
    Destination: {
      ToAddresses: ["mdarsalan81007@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: `Hi, someone is interested in connecting with you on DevTinder!`,
        },
      },
      Subject: { Data: "New Interest on DevTinder!" },
    },
    Source: "arsalansiddiquie007@gmail.com",
  };


  console.log("About to send email via SES");
console.log("Params:", params);

try {
  const command = new SendEmailCommand(params);
  const response = await sesClient.send(command);
  console.log("Email sent successfully", response);
} catch (error) {
  console.error("Error sending email: ", error);
}



    res.json({
        message:status+" request sent successfully",
        data
    })

  }
  catch(err){
      res.status(400).send("ERROR: "+err.message)
  }
  
})


requestRouter.post("/request/review/:status/:requestId" ,userAuth,async (req,res)=>{

  try{
    const {requestId,status} = req.params;
    const loggedInUser = req.user;

    const allowedStatus = ["accepted","rejected"];
    if(!allowedStatus.includes(status)){
        return res.status(400).send(`${status} action not allowed!`)
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id:requestId,
      toUserId:loggedInUser._id,
      status:"interested"

    });
    if(!connectionRequest){
      throw new Error("Connection request not found!")
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.json({
        message:"Connection request "+status,
        data
    })

  }
  catch(err){
      res.status(400).send("ERROR: "+err.message)
  } 
})
 


module.exports = requestRouter;

