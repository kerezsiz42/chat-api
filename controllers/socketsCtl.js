const User = require('../models/User');
const Sockets = require('../models/Sockets');

exports.onmessage = async (data, ws, sockets) => {
  data = JSON.parse(data);
  console.log(data);
  try {
    if(ws.userId != null) {
      const message = await sockets.handleMessage(data.chatId, data.payload, ws);
      const clients = sockets.getClientsInRoom(ws.chatId, ws.userId);
      clients.forEach(client => {
        client.send(JSON.stringify({message}));
      });
    } else {
      ws.userId = await User.authenticate(data.token);
      const success = await sockets.connectToRoom(data.chatId, ws);
      ws.send(JSON.stringify({success}));
    }
  } catch(error) {
    console.log(error);
    ws.send(JSON.stringify({error}));
  }
}

exports.onpong = (ws) => {
  console.log('Ping received')
  ws.isAlive = true;
}

exports.onclose = (ws, sockets) => {
  sockets.disconnectFromRoom(ws);
}

exports.pingInterval = (wss) => setInterval(() => {
  wss.getWss().clients.forEach(client => {
    if (client.isAlive === false) {
      console.log('Terminating connection.');
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);