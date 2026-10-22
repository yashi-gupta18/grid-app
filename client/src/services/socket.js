import { io } from "socket.io-client";

export const API_URL = "https://grid-app-s45j.onrender.com";
export const SOCKET_URL = "https://grid-app-s45j.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 700,
  reconnectionDelayMax: 3000
});