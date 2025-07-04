const mongoose= require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },
        toUserId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },
        status:{
            type:String,
            required:true,
            enum:{
                values:["ignored","interested","accepted","rejected"],
                message:`{VALUE} is incorrect type`
            }
        }
        
    },
    {
        timestamps:true
    }
)


connectionRequestSchema.pre("save", function(next){

    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection to yourself!")
    }

    next();
})

const connectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports = connectionRequestModel;