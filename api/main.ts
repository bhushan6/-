import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";
import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";

const router = new Router();

router.get("/api/helloWorld", (context) => {
  context.response.body = { value: "Hello World!" };
});

// Create Socket.IO server
const io = new Server({
  cors: {
    origin: "http://localhost:5173", // Update this to match your React app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("chat message", (msg) => {
    console.log("Message received:", msg);
    io.emit("chat message", msg);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(routeStaticFilesFrom([
  `${Deno.cwd()}/dist`,
  `${Deno.cwd()}/public`,
]));

const handler = io.handler(async (req) => {
  return await app.handle(req) || new Response(null, { status: 404 });
});

//@ts-expect-error: missing types
Deno.serve({port: 8000}, handler);
