// @deno-types="npm:@types/react@^18.3.3"
import { useEffect, useState } from "react";
import "./App.css";
import { HelloWorld } from "./types.ts";
import { io } from "socket.io-client";

function App() {
  const [helloWorld, setHelloWorld] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/helloWorld`);
      const jsonData = (await resp.json()) as HelloWorld;
      setHelloWorld(jsonData.value);
    })();
  }, []);

  useEffect(() => {
    // Create Socket.IO connection
    const newSocket = io("ws://localhost:8000/", { transports: ["websocket"] });

    newSocket.on("message", (data) => {
      console.log("Received message:", data);
    });

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    return () => {
      newSocket.close();
    };
  }, []);

  if (!helloWorld) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <img src="/deno.png" className="logo" alt="deno logo" />
        <img src="/vite.svg" className="logo" alt="vite logo" />
      </div>
      <h1>{helloWorld}</h1>
      <button
        onClick={() => {
          console.log("Add");
        }}
      >
        Add
      </button>
    </>
  );
}

export default App;
