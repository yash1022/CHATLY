import { getUserSockets } from "./onlineUsers.js"; 


export const handleTyping = (io,socket,payload)=>{
    const senderId = socket.userId;
    const {recieverId , isTyping } = payload;

    try
    {

         if(!senderId || !recieverId)
    {
        return;
    }


    const recieverSockets = getUserSockets(recieverId);

    if(recieverSockets)
    {
        recieverSockets.forEach(socketId=>{
            io.to(socketId).emit('sender_typing',{
                senderId,
                isTyping
            })
        })
    }

    }

    catch(e)
    {
        console.log("Error in handling typing indicator ", e);
        return;
    }

   



   


}