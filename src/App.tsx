// @deno-types="npm:@types/react@^18.3.3"
import { useEffect, useState } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "./shared/types.ts";
import CreateRoom from "./Pages/CreateRoom.tsx";
import Game from "./Pages/Game.tsx";
import LatencyMonitor from "./Components/LatencyMonitor.tsx";

export type ClientSocketType = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

function App() {
  const [socket, setSocket] = useState<ClientSocketType | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    // Create Socket.IO connection
    const newSocket: ClientSocketType = io("/", {
      transports: ["websocket"],
    });

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!socket) return <div>Loading...</div>;

  return (
    <>
      {playerId === null && (
        <CreateRoom socket={socket} setPlayerId={setPlayerId} />
      )}
      {playerId && <Game playerId={playerId} />}
      <LatencyMonitor socket={socket} />
    </>
  );
}

export default App;
