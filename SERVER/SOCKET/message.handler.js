import Message from "../model/Message.js";
import {
    getUserSockets
} from "./onlineUsers.js";


export const handleMessage = async (io , socket , payload)=>{
    try{

         const {recieverId ,content,iv} = payload;
    const senderId = socket.userId;

    if(!recieverId || !content)
    {
        return;
    }

    const recieverSockets = getUserSockets(recieverId);


    
        const message = await Message.create({
            sender: senderId,
            reciever: recieverId,
            content,
            iv,
            isRead:false
        })

        const payloadMessage = {
            ...message.toObject(),
            iv
        }

       
    
    

     // EMIT TO SENDER

     console.log(payloadMessage);

     socket.emit("new_message",{
        payloadMessage
     })
      
     // EMIT TO RECIEVER

     if(recieverSockets?.size > 0)
    {
        recieverSockets.forEach((socketId) => {
            io.to(socketId).emit("new_message",{ payloadMessage });
        });
    }



    }
    catch(err)
    {
        console.log("Error in handling message " , err);
    }
    
}