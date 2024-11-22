// @deno-types="npm:@types/react@^18.3.3"
import { useState, useEffect } from "react";
import { ClientSocketType } from "../App.tsx";

const LatencyMonitor = ({ socket }: { socket: ClientSocketType }) => {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const t  = setInterval(() => {
        const start = Date.now();

        //@ts-expect-error: ping is internal socket.io event
        socket.emit("ping", () => {
          const duration = Date.now() - start;
          setLatency(duration)
        });
    }, 1000)

    return () => clearInterval(t)
  }, [])

  return <div>Latency : {latency}ms</div>;
};

export default LatencyMonitor;
