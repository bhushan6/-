// Define the structure of events
export interface ServerToClientEvents {
  startGame: (data: ArrayBuffer) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: ArrayBuffer) => void;
  joinRoom: (data: ArrayBuffer) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {

}
