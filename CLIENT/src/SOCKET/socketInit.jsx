import { io } from "socket.io-client";

let socket = null;
let currentToken = null;

export const connectSocket = (accessToken) => {
  if (!accessToken) return null;

  // if socket already exists
  if (socket) {
    // token changed → force re-auth
    if (currentToken !== accessToken) {
      currentToken = accessToken;
      socket.auth = { token: accessToken };

      // clean reconnect
      socket.disconnect();
      socket.connect();
    }
    return socket;
  }

  // first-time connection
  currentToken = accessToken;

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token: accessToken }
  });

  socket.on("connect", () => {
    console.log("SOCKET CONNECTED:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("SOCKET ERROR:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
  currentToken = null;
};
