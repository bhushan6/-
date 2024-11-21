// @deno-types="npm:@types/react@^18.3.3"
import { bufferToBase64, encodeRoomData } from "../shared/card.ts";
import { ClientSocketType } from "../App.tsx";

const CreateRoom = ({socket, setPlayerId}: {socket: ClientSocketType, setPlayerId: React.Dispatch<React.SetStateAction<number | null>>}) => {
 
  return (
    <div>
      <form
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          //@ts-expect-error : formData is not defined in react
          const formDataObj = new FormData(e.target);

          const formValues = Object.fromEntries(formDataObj.entries()) as {
            size: string;
            name: string;
            numOfCards: string;
          };
        
          if(formValues.size && formValues.name && formValues.numOfCards ){
            //size and numOfCards as query param
            const url = `/api/createRoom?size=${formValues.size}&numOfCards=${formValues.numOfCards}`;
            const response = await fetch(url);
            const data = await response.json();
            if(response.status === 201){
              const roomId = data.roomId;
              const size = formValues.size;
              const numOfCards = formValues.numOfCards;
              socket.emit("joinRoom", { roomId, name: formValues.name }, (playerId) => {
                // console.log("Player ID:", playerId);
                if(playerId !== null){
                    const encodedRoomData = encodeRoomData(roomId, size, numOfCards);
                    const encryptedRoomData = bufferToBase64(encodedRoomData);
                    setPlayerId(Number(playerId));
                    history.pushState(null, '', `/room/${encryptedRoomData}`); 
                    // window.location.href = `/room/${encryptedRoomData}`;
                }
              });
            //   const encodedRoomData = encodeRoomData(roomId, size, numOfCards);
            //   const encryptedRoomData = bufferToBase64(encodedRoomData);
              //redirect to room page
            //   window.location.href = `/room/${encryptedRoomData}`;
            }
          }

        }}
      >
        <div>
          <label>Name</label>
          <input value={"Bhushan"} name="name" required type="text" />
        </div>
        <div>
          <label>Number of Players</label>
          <input value={2} name="size" required min={2} type="number" />
        </div>
        <div>
          <label>Number of Cards</label>
          <input value={5} name="numOfCards" required min={2} type="number" />
        </div>
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
};

export default CreateRoom;
