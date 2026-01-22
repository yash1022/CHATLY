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

    isUsed:{
        type: Boolean,
        default: false
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

ConversationKeySchema.index({ isUsed: 1, createdAt: 1 });

ConversationKeySchema.statics.cleanupUnusedKeys = async function(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.deleteMany({ isUsed: false, createdAt: { $lte: cutoff } });
};

const ConversationKey = mongoose.model("ConversationKey",ConversationKeySchema);

export default ConversationKey;
