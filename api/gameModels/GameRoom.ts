import {
  decodeCard,
  DecodeCardType,
  generateUnoDeck,
} from "../../src/shared/card.ts";
import { Socket, Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../src/shared/types.ts";
import { io } from "socket.io-client";

type UserType = {
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  name: string;
  disconnected?: boolean;
  id: string;
  cards: number[];
};

export class GameRoom {
  private _deck = generateUnoDeck(true);

  private _roomId: string;

  private _players = new Map<string, UserType>();

  private _size: number;

  private _gameStarted = false;

  private _disconnectedPlayers: UserType[] = [];

  private _direction: 1 | -1 = 1;

  public get size() {
    return this._size;
  }

  private _io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  private _numberOfCards: number;

  constructor({
    id,
    size,
    io,
    numberOfCard,
  }: {
    id: string;
    size: number;
    io: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >;
    numberOfCard: number;
  }) {
    this._roomId = id;
    this._size = size;
    this._io = io;
    this._numberOfCards = numberOfCard;
  }

  public addPlayer = (user: Omit<UserType, "id">) => {
    const filledRoomSize = this._players.size;
    if (this.size === this._players.size) {
      console.warn("Room is already full");
      return null;
    }
    user.disconnected = false;
    const newUser: UserType = { ...user, id: `${filledRoomSize}` };
    this._players.set(newUser.id, newUser);
    user.socket.join(this._roomId);



    // if (this.size === this._players.size) {
    //   const firstCard = this.distributesCards();

    //   this._players.forEach((player) => {
    //     const cards = player.cards;
    //     cards.push(this._numberOfCards, firstCard);
    //     player.socket.emit("startGame", new Uint8Array(cards));
    //   });

    //   this._gameStarted = true;
    // }
    return newUser.id;
  };

  public disconnectPlayer = (player: UserType) => {
    const playerInRoom = this._players.get(player.id);
    if (!playerInRoom) {
      throw new Error("Player does not exist in this room");
    }
    player.disconnected = true;
  };

  public rejoinPlayer = (
    userId: string,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  ) => {
    const user = this._players.get(userId);
    if (!user)
      throw new Error(`User with user id : ${userId} does not exist in room`);
    user.socket = socket;
    user.disconnected = false;
  };

  public distributesCards = () => {
    if (this.size !== this._players.size) {
      throw new Error(
        "Can't start distributing cards until everyone has joined"
      );
    }

    for (let i = 0; i < this._numberOfCards; i++) {
      this._players.forEach((user) => {
        const card = this._deck.splice(0, 1)[0];
        if (!card)
          throw new Error(
            `No card at index : ${0}, deck size is : ${this._deck.length}`
          );
        user.cards.push(card);
      });
    }
    //splice last cardrd from deck
    const lastCard = this._deck.splice(this._deck.length - 1, 1)[0];
    return lastCard;
  };
}
