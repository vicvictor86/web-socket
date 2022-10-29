import { io } from "./http";

interface RoomUser {
  socket_id: string,
  username: string,
  room: string
}

interface Message {
  room: string, 
  text: string,
  createdAt: Date,
  username: string
}

const users: RoomUser[] = [];
const messages: Message[] = [];

io.on("connection", socket => {
  socket.on("select_room", (data, callback) => {
    socket.join(data.room);

    const userInRoom = users.find(user => user.username === data.username && user.room === data.room);

    if(userInRoom) {
      userInRoom.socket_id = socket.id;
    } else {
      users.push({
        socket_id: socket.id,
        username: data.username,
        room: data.room,
      });
    }

    const userMessages = getUserMessages(data.room);
    callback(userMessages);
  });

  socket.on("message", data => {
    const message: Message = {
      room: data.room,
      username: data.username,
      text: data.message,
      createdAt: new Date(),
    }

    messages.push(message);

    io.to(data.room).emit("message", message);
  })
})

function getUserMessages(room: string){
  const userMessages = messages.filter(message => message.room === room);
  return userMessages;
}