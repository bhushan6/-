// @deno-types="npm:@types/react@^18.3.3"
import  { useEffect, useState } from "react"
import "./App.css";
import { HelloWorld } from "./types.ts";
import { io, Socket  } from "socket.io-client";

function App() {
  
  const [helloWorld, setHelloWorld] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/helloWorld`);
      const jsonData = await resp.json() as HelloWorld;
      setHelloWorld(jsonData.value);
    })();
  }, []);

  useEffect(() => {
    // Create Socket.IO connection
    const newSocket = io('http://localhost:8000', {transports: ['websocket']});
    // setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

   
    return () => {
      newSocket.close();
    };
  }, []);

  if(!helloWorld) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <h1>{helloWorld}</h1>
    </>
  );
}

export default App;
