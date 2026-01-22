import { get } from "mongoose";
import Message from "../model/Message.js";
import { getUserSockets } from "./onlineUsers.js";



export const handleRead = async (io, socket,payload)=>{

    const {senderId } = payload;
    const recieverId = socket.userId;


    if(!recieverId || !senderId)
    {
        return;
    }

    try{

         await Message.updateMany(
            {
                sender: senderId,
                reciever : recieverId,
                isRead:false
            },
            {
                isRead:true,
                readAt: new Date()
            }
        )

        //NOTIFY SENDER IF ONLINE

        const senderSockets = getUserSockets(senderId);

        if(senderSockets)
        {
            senderSockets.forEach(socketId=>{
                io.to(socketId).emit('messages_read',{
                    senderId,
                    recieverId
                })
            })
        }
    }
    catch(err)
    {
        console.log("Error in handling read receipt ", err);
        return;
    }



}