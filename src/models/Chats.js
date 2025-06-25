const mongoose  = require("mongoose");
const validator = require("validator");

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String
  },
  photoUrl: {
    type: String,
    validate(value) {
      if (value && !validator.isURL(value)) {
        throw new Error("Invalid photo URL: " + value);
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



module.exports = mongoose.model("Chat",chatSchema);