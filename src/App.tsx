import React, { useEffect, useState } from "react"
import "./App.css";
import {HelloWorld} from "./types.ts";

function App() {

  const [helloWorld, setHelloWorld] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/helloWorld`);
      const jsonData = await resp.json() as HelloWorld;
      setHelloWorld(jsonData.value);
    })();
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
