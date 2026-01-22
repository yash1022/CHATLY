import ConversationKey from "../MODEL/ConversationKey.js";
import mongoose from 'mongoose';


export const storeConversationKey = async(req,res)=>{
    try{
        const senderId = req.user._id;
        const { recieverId, encryptedAesKeyForReciever,encryptedAesKeyForSender} = req.body;

        if(!recieverId  || !encryptedAesKeyForSender || !encryptedAesKeyForReciever)
        {
            return res.status(400).json({message: "recieverId and encryptedAesKey are required"});
        }

        console.log("AES KEY FOR RECIEVER-->",encryptedAesKeyForReciever)
        

        
        await ConversationKey.findOneAndUpdate(
            {senderId:senderId,recieverId:recieverId},
            { encryptedAesKey: encryptedAesKeyForReciever },
            { upsert: true, new: true }
        );

        await ConversationKey.findOneAndUpdate(
        
               {senderId:recieverId,recieverId:senderId},
               {encryptedAesKey:encryptedAesKeyForSender},
               {upsert:true}
        );

        res.status(200).json({ message: "Conversation key stored successfully" });
    }
    catch(error){
        console.error("Error storing conversation key:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getConversationKey = async(req,res)=>{
    try{ 

        const senderId =  new mongoose.Types.ObjectId(req.params.id);;
        const recieverId = req.user._id;

        console.log(senderId);
        console.log(recieverId);

        const conversationKey = await ConversationKey.findOne({

            senderId,
            recieverId
        })

        if(!conversationKey)
        {
            return res.status(404).json({ message: "Conversation key not found" });
        }

        return res.status(200).json({ encryptedAesKey: conversationKey.encryptedAesKey, isUsed: conversationKey.isUsed });

    }
    catch(error)
    {
        console.error("Error retrieving conversation key:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}