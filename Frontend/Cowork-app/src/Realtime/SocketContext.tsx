import { createContext } from "react";
import { Socket } from "socket.io-client";
import { socket } from "./socket.ts"; 

const SocketContext = createContext<Socket | undefined>(socket);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };