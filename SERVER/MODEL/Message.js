import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({

    sender:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },

    reciever:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true

    },

    content:{
        type:String,
        required:true,
        trim:true
    },

    iv:{
        type:String,
        required:true
    },

    isRead:{
        type:Boolean,
        default:false
    },

    readAt:{
        type:Date,
        default:null
    }



},{ timestamps: true }
)

export const Message = mongoose.model('Message',messageSchema);
export default Message;