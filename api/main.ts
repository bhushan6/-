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
// import { decodeRoomData  } from "../src/shared/card.ts";

//API Router
const router = new Router();

// Socket.IO server initialization
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

//API Routes
router.get("/api/createRoom", (context) => {
  //get query params
  const size = context.request.url.searchParams.get("size");
  const numberOfCard = context.request.url.searchParams.get("numOfCards");

  if (!size || !numberOfCard) {
    context.response.body = { error: "Invalid parameters" };
    context.response.status = 400;
    return;
  }
  //look for which room index is available
  const numOfRooms = gameRoomMap.size;
  //first room
  if (numOfRooms === 0) {
    const gameRoom = new GameRoom({
      id: `0`,
      size: Number(size),
      io,
      numberOfCard: Number(numberOfCard),
    });
    gameRoomMap.set(`0`, gameRoom);
    context.response.body = { roomId: 0 };
    context.response.status = 201;
    return;
  }
  //if all rooms are full
  //TO DO: add pagination to the rooms
  if (numOfRooms === 256) {
    context.response.body = { error: "No more rooms available" };
    context.response.status = 400;
    return;
  }
  let roomId: number | null = null;
  for (let i = 0; i < numOfRooms; i++) {
    if (gameRoomMap.get(`${i}`) == undefined) {
      roomId = i;
      const gameRoom = new GameRoom({
        id: `${i}`,
        size: Number(size),
        io,
        numberOfCard: Number(numberOfCard),
      });
      gameRoomMap.set(`${i}`, gameRoom);
      break;
    }
  }
  if (roomId == null) {
    roomId = numOfRooms;
    const gameRoom = new GameRoom({
      id: `${roomId}`,
      size: Number(size),
      io,
      numberOfCard: Number(numberOfCard),
    });
    gameRoomMap.set(`${roomId}`, gameRoom);
  }
  context.response.body = { roomId };
  context.response.status = 201;
});

//socket io
io.on("connection", (socket) => {
  socket.on("joinRoom", (data, callback) => {
    const gameRoom = gameRoomMap.get(`${data.roomId}`);

    if (!gameRoom)
      throw new Error(`Game room with an id ${data.roomId} does not exist`);

    const playerId = gameRoom.addPlayer({
      name: data.name,
      socket: socket,
      disconnected: false,
      cards: [],
    });

    gameRoom.rejoinPlayer;

    callback(playerId);
  });

  //@ts-expect-error: ping is internal socket.io event
  socket.on("ping", (callback) => {
    callback();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

//Boilerplate stuff
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
