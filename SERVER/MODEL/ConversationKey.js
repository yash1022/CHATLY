import mongoose from "mongoose";


const ConversationKeySchema = new mongoose.Schema({
    
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    recieverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    encryptedAesKey:{
        type: String,
        required: true
    }




},{
    timestamps: true
});

ConversationKeySchema.index(
  { senderId: 1, recieverId: 1 },
  { unique: true }
);

const ConversationKey = mongoose.model("ConversationKey",ConversationKeySchema);

export default ConversationKey;
