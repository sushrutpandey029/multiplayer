////////////////////////////////////////////////////////////////////////////////////////

//                          SCRIPT FILE FOR ROOMS (CLIENT SIDE)

/////////////////////////////////////////////////////////////////////////////////////////


// import {io} from "socket.io-client"

const socket = io("http://localhost:3000");
const messageForm = document.getElementById("send-container");
const messageInp = document.getElementById("message-input");
const messagesCont = document.getElementById("messages");

var turn = {};
var turnFlag = false;

// TIMER FUNCTION 

function timer() {
  setTimeout(() => {
    if (turnFlag) {
      document.getElementById("message-input").disabled = true;
      socket.emit("BtnStarted", turn.index, roomId);
      turnFlag = false;
    }
  }, 15000);
}


// START BUTTON FUNCTION WHEN PRESSED EXECUTES THE TRUN MANAGEMENT FOR USERS

const startBtn = document
  .getElementById("startBtn")
  .addEventListener("click", () => {
    console.log("btn clicked !!");
    socket.emit("BtnStarted", 0, roomId);
    turnFlag = true;
    // timer();
  });
document.getElementById("message-input").disabled = true;



// FUNCTION TO APPEND ANY TEXT TO CIENT ROOM SIDE
function appendText(data) {
  const newMessage = document.createElement("div");
  newMessage.innerText = data;
  messagesCont.appendChild(newMessage);
}

if (messageForm != null) {
  var Name = prompt("Enter your name here...");
  socket.emit("new-user", roomId, Name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInp.value;
    socket.emit("send-chat-message", roomId, Name, message);
    // clearTimeout(timer);
    messageInp.value = "";
    document.getElementById("message-input").disabled = true;
    socket.emit("BtnStarted", turn.index, roomId);
    turnFlag = false;
  });
}

// console.log(joinee.split(","));

joineeArr = joinee.split(",");
console.log(joineeArr);

const removeUser = (sid) => {
  socket.disconnect(sid);
};

// console.log(roomJoinees);

// socket.on("total_user", () => {
//   // if(joineeArr!== " ")
//   joineeArr.forEach(e => {
//     const currUserList = document.createElement("div");
//     const userId = document.createElement("span");
//     const removeBtn = document.createElement("button");
//     currUserList.append(userId)
//     currUserList.append(removeBtn);
//     userId.innerText = e;
//     removeBtn.innerText = "kick out";
//     // removeBtn.onclick(removeUser(e));
//     currentUser.append(currUserList);
//   });

// });

// socket.on("room-created", (room) => {
//   const roomElement = document.createElement("div");
//   roomElement.innerText = room.roomName;
//   const roomLink = document.createElement("a");
//   roomLink.href = `/${room}`;
//   roomLink.innerText = "JOIN";
//   roomContainer.append(roomElement);
//   roomContainer.append(roomLink);
// });



// WHEN USER CONNECTED TO SOCKET SERVER 

socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  // roomJoinees[socket.id] = Name;
});


// WHEN NEW USER GETS JOINED TO SERVER

socket.on("userJoined", (data) => {
  roomJoinees = data;
  console.log(data);
});


// WHEN SERVER ASKS TO CHANGE TURN IN CLIENT SIDE

socket.on("turnChanged", (data) => {
  if (socket.id == data.sid) {
    document.getElementById("message-input").disabled = false;
    console.log("turn changed");
    turnFlag = true;
    // turnPeriod();
    timer();
  }
  turn = data;
  if (data.index > 3)
    turn.index = 0;
  // socket.emit("BtnStarted", 0, roomId);
  console.log(data);

  // setTimeout(() => {
  //   socket.emit("BtnStarted", turn.index, roomId);
  // }, 5000);
});

const currentUser = document.getElementById("currentUsers");

// WHEN NEW USER JOINS APPEND USER JOINED MSG

socket.on("new-user-alert", (data) => {
  appendText(data + " joined");
  // console.log(data);
  // const currentUser = document.getElementById("currentUsers");
  // currentUser.innerHTML += `
  //   <span id="kickuser"  >
  //           ${socket.id}
  //           </span>
  //           <button onclick="kickoutUser">kick out</button>
  //   `;
});



// APPEND THE RECIEVED CHAT MESSAGE FROM SERVER

socket.on("chat-message", (data) => {
  appendText(data.name + ": " + data.message);
  // console.log(data);
});


// WHEN USER GETS DISCONNECTED APPEND USER DISCONNECTED TEXT

socket.on("user-disconnect", (data) => {
  console.log(data + "disconnected");
  appendText(`${data} disconnected...`);
});


// CREATE ALERT WHEN USER IS KICKED OUT

function kickoutUser(sid) {
  const kickuser = document.getElementById("kickuser");
  // alert("kickout user"+ sid)
  console.log(kickuser.innerText);
}
