import React, { createContext, useEffect } from "react";
import { Socket } from "socket.io-client";
import { socket } from "./socket.ts"; 

const SocketContext = createContext<Socket>(socket);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    console.log("✅ SocketProvider mounted");

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", socket.id, "Reason:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Connection error:", err.message);
    });

    return () => {
      socket.off(); // clean up listeners
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };