export type UnoCard = number;

export function encodeCard(color: number, value: number): UnoCard {
  return (color << 4) | value;
}

type UnoColors = "Red" | "Green" | "Blue" | "Yellow" | "Wild";
type UnoActionCards =
  | "Skip"
  | "Reverse"
  | "Draw Two"
  | "Wild Draw Four"
  | "Wild";
type UnoNumbers = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const colors: { [key in UnoColors]: number } = {
  Red: 0,
  Green: 1,
  Blue: 2,
  Yellow: 3,
  Wild: 4,
};
const reverseColorMap: UnoColors[] = ["Red", "Green", "Blue", "Yellow", "Wild"];

const values: { [key in UnoNumbers | UnoActionCards]: number } = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  Skip: 10,
  Reverse: 11,
  "Draw Two": 12,
  Wild: 13,
  "Wild Draw Four": 14,
};

const reverseValuesMap: (UnoNumbers | UnoActionCards)[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Skip",
  "Reverse",
  "Draw Two",
  "Wild",
  "Wild Draw Four",
];

export type DecodeCardType = {
  color: UnoColors;
  value: (UnoNumbers | UnoActionCards)[];
};

export function decodeCard(card: UnoCard): DecodeCardType {
  return {
    color: reverseColorMap[card >> 4],
    //@ts-expect-error
    value: reverseValuesMap[card & 0x0f] as (UnoNumbers | UnoActionCards)[],
  };
}

export const shuffleCards = (deck: UnoCard[]) => {
  // Shuffle the deck using Fisher-Yates algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export function generateUnoDeck(shuffle?: boolean): UnoCard[] {
  const deck: UnoCard[] = [];

  // Add number and zero cards for each color
  for (const colorName of ["Red", "Green", "Blue", "Yellow"] as UnoColors[]) {
    const colorIndex = colors[colorName];

    // Add one zero card for each color
    deck.push(encodeCard(colorIndex, values["0"]));

    // Add two of each number (1-9) for each color
    for (let i = 1; i <= 9; i++) {
      const _cardValue = `${i}` as UnoNumbers;
      deck.push(encodeCard(colorIndex, values[_cardValue]));
      deck.push(encodeCard(colorIndex, values[_cardValue]));
    }

    // Add action cards for each color
    const actionCards = ["Skip", "Reverse", "Draw Two"] as UnoActionCards[];
    for (const action of actionCards) {
      deck.push(encodeCard(colorIndex, values[action]));
      deck.push(encodeCard(colorIndex, values[action]));
    }
  }

  // Add Wild cards
  const wildCards = ["Wild", "Wild Draw Four"] as UnoActionCards[];
  for (const card of wildCards) {
    for (let i = 0; i < 4; i++) {
      deck.push(encodeCard(colors["Wild"], values[card]));
    }
  }

  return shuffle ? shuffleCards(deck) : deck;
}

// Universal encoding function (works in browser and Node.js)
export function encodeUserData(
  userId: number,
  roomId: number,
  userName: string
): ArrayBuffer {
  // Validate input ranges
  if (userId < 0 || userId > 9) throw new Error("User ID must be between 0-9");
  if (roomId < 0 || roomId > 255)
    throw new Error("Room ID must be between 0-255");

  // Use ArrayBuffer for cross-platform compatibility
  const buffer = new ArrayBuffer(2 + new TextEncoder().encode(userName).length);
  const view = new DataView(buffer);

  // Encode user ID (4 bits) and room ID (8 bits)
  view.setUint16(0, (userId << 8) | roomId);

  // Encode name using TextEncoder
  const nameBytes = new TextEncoder().encode(userName);
  const nameView = new Uint8Array(buffer, 2);
  nameView.set(nameBytes);

  return buffer;
}

// Universal decoding function
export function decodeUserData(buffer: ArrayBuffer): {
  userId: number;
  roomId: number;
  userName: string;
} {
  const view = new DataView(buffer);

  // Extract user ID (first 4 bits) and room ID (next 8 bits)
  const combinedId = view.getUint16(0);
  const userId = combinedId >> 8;
  const roomId = combinedId & 0xff;

  // Decode name using TextDecoder
  const nameBytes = new Uint8Array(buffer, 2);
  const userName = new TextDecoder().decode(nameBytes);

  return { userId, roomId, userName };
}

export function bufferToBase64(buffer: ArrayBuffer) {
  //@ts-expect-error : Uint8Array is valid argument for number of array
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

// Convert Base64 back to ArrayBuffer
export function base64ToBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function encodeRoomData(
  roomId: number,
  size: number,
  numberOfCards: number
): ArrayBuffer {
  // Validate input ranges
  if (roomId < 0 || roomId > 255)
    throw new Error("Room ID must be between 0-255");
  if (size < 0 || size > 9) throw new Error("Size must be between 0-9");
  if (numberOfCards < 2 || numberOfCards > 10)
    throw new Error("Number of cards must be between 2-10");

  // Create buffer
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);

  // Pack data into 16 bits:
  // First 8 bits: Room ID
  // Next 4 bits: Size
  // Last 4 bits: Number of Cards
  view.setUint16(
    0,
    (roomId << 8) | ((size & 0x0f) << 4) | (numberOfCards & 0x0f)
  );

  return buffer;
}

export function decodeRoomData(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const packedData = view.getUint16(0);

  const roomId = packedData >> 8;
  const size = (packedData >> 4) & 0x0f;
  const numberOfCards = packedData & 0x0f;

  return { roomId, size, numberOfCards };
}

// const roomBuffer = encodeRoomData(200, 4, 5);
// console.log(roomBuffer);

// console.log(decodeRoomData(roomBuffer));

//   // Example usage in both client and server
//   try {
//     const originalData = encodeUserData(5, 128, "PlayerOne");
//     console.log(originalData);

//     const decodedData = decodeUserData(originalData);
//     console.log(decodedData);

//     const base64 = bufferToBase64(originalData);
//     console.log(base64);
//     const decodedBase64 = base64ToBuffer(base64);
//     console.log(decodedBase64);

//     const decodedData2 = decodeUserData(decodedBase64);
//     console.log(decodedData2);
//     // Expected output: { userId: 5, roomId: 128, userName: "PlayerOne" }
//   } catch (error) {
//     console.error("Encoding/Decoding error:", error);
//   }
