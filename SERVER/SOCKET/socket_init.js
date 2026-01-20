import {Server} from 'socket.io'; 
import socketAuthMiddleware from '../MIDDLEWARE/socketAuthMiddleware.js';
import {
    addUserSocket,
    removeUserSocket,
    isUserOnline,
    getOnlineUserIds
} from './onlineUsers.js';
import { handleTyping } from './typingIndicator.js';

import {handleMessage} from '../SOCKET/message.handler.js'
import { handleRead } from './readReceipt.js';


const initSocket = (server)=>{

    const io = new Server(server,{
        cors:{
            origin:'http://localhost:5173',
            methods:['GET','POST'],
            credentials:true

        }
    })


    io.use(socketAuthMiddleware);


    io.on('connection',(socket)=>{
        const userId = socket.userId;
        const socketId = socket.id
        console.log("NEW CLIENT CONNECTED");
        console.log("USER ID :",userId);
        console.log("SOCKET ID :",socketId);
        
        const wasOnline = isUserOnline(userId);
        
        addUserSocket(userId , socketId);

        if(!wasOnline)
        {
            io.emit('user_online',{userId})
            console.log("USER CAME ONLINE :",userId);
        }

        socket.emit('online_users',{onlineUserIds:getOnlineUserIds()});
        

        socket.on('send_message',(payload)=>{
            handleMessage(io , socket , payload);
        })

        socket.on('mark_as_read',(payload)=>{
            handleRead(io , socket , payload);
        })

        socket.on('typing_indicator',(payload)=>{
            handleTyping(io , socket , payload);
        })


        socket.on('disconnect',()=>{
            removeUserSocket(userId , socketId);
            const stillOnline =  isUserOnline(userId);

            if(!stillOnline)
            {
                io.emit('user_offline',{userId});
                console.log("USER WENT OFFLINE :",userId);
            }
            console.log("CLIENT DISCONNECTED");
        })
    }) 



}


export default initSocket;