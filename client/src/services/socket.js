import { io } from "socket.io-client";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 700,
  reconnectionDelayMax: 3000
});
