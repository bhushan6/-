import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";
import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import { GameRoom } from "./gameModels/GameRoom.ts";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../src/shared/types.ts";
import { decodeRoomData } from "../src/shared/card.ts";

const router = new Router();

console.log(decodeRoomData);

//REST API routes example
router.get("/api/helloWorld", (context) => {
  context.response.body = { value: "Hello World!" };
});

// Create Socket.IO server
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: "http://localhost:5173", // Update this to match your React app URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const gameRoomMap = new Map<string, GameRoom>();

//socket io  example
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("createRoom", (data) => {
    // const gameRoom = new GameRoom({
    //   id: data.id,
    //   size: data.size,
    //   io,
    //   numberOfCard: data.numberOfCard,
    // });
    // gameRoomMap.set(data.id, gameRoom);
  });

  socket.on("joinRoom", (data) => {
    console.log(data, "ADD PLAYER");
    // const gameRoom = gameRoomMap.get(data.roomId);
    // if (!gameRoom)
    //   throw new Error(`Game room with an id ${data.roomId} does not exist`);
    // gameRoom.addPlayer({
    //   id: data.id,
    //   name: data.name,
    //   socket: socket,
    //   disconnected: false,
    //   cards: [],
    // });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(routeStaticFilesFrom([`${Deno.cwd()}/dist`, `${Deno.cwd()}/public`]));

const handler = io.handler(async (req) => {
  return (await app.handle(req)) || new Response(null, { status: 404 });
});

//@ts-expect-error: missing types
Deno.serve({ port: 8000 }, handler);
