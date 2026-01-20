// import socket from authProvider
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const OnlineUsersContext = createContext();

export const OnlineUsersProvider = ({children})=>{
    const { socket } = useAuth();
    const [onlineUserIds , setOnlineUserIds] = useState([]);



    useEffect(()=>{
        if(!socket){
            setOnlineUserIds([]);
            return;
        }

        const handleOnline = ({userId})=>{
            setOnlineUserIds((prev)=>{
                if(!prev.includes(userId))
                {
                    return [...prev , userId];

                }
                else
                {
                    return prev;
                }
            })

        }


        const handleOffline = ({userId})=>{
            setOnlineUserIds((prev)=>{
                return prev.filter((id)=> id!==userId);
            })

        }

            const handleSnapshot = ({ onlineUserIds: snapshotIds }) => {
                setOnlineUserIds(snapshotIds || []);
        };



         socket.on("user_online", handleOnline);
         socket.on("user_offline", handleOffline);
         socket.on("online_users", handleSnapshot);


          return () => {
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
      socket.off("online_users", handleSnapshot);
    };



    },[socket])

    return(
        <OnlineUsersContext.Provider value={{onlineUserIds}}>
            {children}
        </OnlineUsersContext.Provider>
    )
}

export const useOnlineUsers = () => useContext(OnlineUsersContext);


