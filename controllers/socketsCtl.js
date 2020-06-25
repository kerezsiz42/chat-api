const User = require('../models/User');
const Chat = require('../models/Chat');

exports.onmessage = async (data, ws, sockets) => {
  data = JSON.parse(data);
  console.log(data);
  try {
    if(ws.userId == null) {
      ws.userId = await User.authenticate(data.token);
      const success = await sockets.connectToRooms(ws);
      ws.send(JSON.stringify({success}));
    } else if(data.messagesCount != undefined) {
      if(!ws.chatIds.includes(data.chatId)) {
        throw 'Unauthorized or chat does not exist.';
      }
      const messages = await Chat.loadLastMessages(data.chatId, data.messagesCount, data.messageTime);
      ws.send(JSON.stringify({messages}));
    } else {
      const message = await sockets.handleMessage(data.chatId, data.payload, ws);
      const clients = sockets.getClientsInRoom(data.chatId);
      clients.forEach(client => {
        client.send(JSON.stringify({message}));
      });
    }
  } catch(error) {
    //console.log(error);
    ws.send(JSON.stringify({error}));
  }
}

exports.onpong = (ws) => {
  ws.isAlive = true;
  console.log('Pong received from', ws.userId);
}

exports.onclose = (ws, sockets) => {
  console.log(`Connection with ${ws.userId} closed.`);
  sockets.disconnectFromRooms(ws);
  // ws = null;
}

exports.pingInterval = (wss) => setInterval(() => {
  wss.clients.forEach(client => {
    if (client.isAlive === false) {
      console.log('Terminating connection with', client.userId);
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);