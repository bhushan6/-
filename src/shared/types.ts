// Define the structure of events
export interface ServerToClientEvents {
  startGame: (data: ArrayBuffer) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: {roomId: number, name: string}, callback: (playerId: string | null) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {

}
