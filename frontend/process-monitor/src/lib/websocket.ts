"use client";

import { io, Socket } from "socket.io-client";

export function createWebSocket(host: string, onMessage: (data: any) => void) {
  const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || "ws://127.0.0.1:8000/ws";
  const url = `${WS_BASE}/processes/${encodeURIComponent(host)}/`;
  
  const socket = io(url, {
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => console.log("WebSocket connected"));
  socket.on("message", onMessage);
  socket.on("disconnect", () => console.log("WebSocket disconnected"));
  
  return socket;
}
