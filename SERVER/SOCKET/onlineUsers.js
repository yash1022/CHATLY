const onlineUsers = new Map();

export const addUserSocket = (userId , socketId)=>{

    if(!onlineUsers.has(userId))
    {
        onlineUsers.set(userId , new Set());
    }

    onlineUsers.get(userId).add(socketId);
}


export const removeUserSocket = (userId , socketId)=>{
    if(onlineUsers.has(userId))
    {
        const sockets = onlineUsers.get(userId);
        sockets.delete(socketId);
        if(sockets.size === 0)
        {
            onlineUsers.delete(userId);
        }
    }

    else
    {
        return;
    }
}

export const isUserOnline = (userId)=>{
    return onlineUsers.has(userId);
}

export const getOnlineUserIds = ()=>{
    return Array.from(onlineUsers.keys());
}

export const getUserSockets  = (userId)=>{
    return onlineUsers.get(userId);
}