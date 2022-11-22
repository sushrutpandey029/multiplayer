const socket = io("https://frozen-fortress-11007.herokuapp.com/");
const roomContainer = document.getElementById("room-container");



socket.on("room-created", (room) => {
    
    // console.log(room);
  const roomElement = document.createElement("div");
  roomElement.innerText = room.roomName;
  const roomLink = document.createElement("a");
  roomLink.href = `/${room._id}`;
  roomLink.innerText = "Join";
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
});
