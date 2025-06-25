const socket  = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/Chats");

const generateRoomId = (userId, targetUserId)=> {
  const baseString = [userId, targetUserId].sort().join("_");
  return crypto.createHash('sha256').update(baseString).digest('hex')+process.env.ROOM_SECRET;
}


const initializeSocket = (server)=>{
    const io = socket(server, {
        cors:{
            origin: process.env.CLIENT_URL,
        },
    });

    io.on("connection" ,(socket) =>{
        // Handle events
        socket.on("joinChat",({firstName,userId,targetUserId})=>{
            const roomId = generateRoomId(userId, targetUserId);


            console.log(firstName+" joined room : "+roomId);
            
            socket.join(roomId);
        });
        socket.on("sendMessage",async ({ firstName, userId, targetUserId, text, photoUrl, createdAt })=>{
            const roomId = generateRoomId(userId, targetUserId);
            try{
                const chat = new Chat({ firstName, userId, targetUserId, text, photoUrl, createdAt }) 
                await chat.save();

            }
            catch(err){
                if (process.env.NODE_ENV !== "production") {
                console.error("Error saving chat:", err.message);
            }
            }

            console.log(firstName+" "+text);
            
            io.to(roomId).emit("messageRecieved",{firstName,userId,targetUserId,text,photoUrl,createdAt})
        });
        socket.on("disconnect",(reason)=>{
            console.log("Socket disconnected:", reason);
        });
    })
}

module.exports = initializeSocket;
