import { io } from "socket.io-client";

export const socket = io("http://localhost:8080", {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});