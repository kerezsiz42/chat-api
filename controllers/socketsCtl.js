const User = require('../models/User');



exports.connection = (ws, socketsChache) => {
  const state = {
    userId: null,
    chatId: null
  }

  ws.on('message', async data => {
    data = JSON.parse(data);
    console.log(data);
    try {
      if(state.userId != null) {
        const message = await socketsChache.handleMessage(data.chatId, data.payload, state, ws);
        const clients = socketsChache.getClientsInRoom(state.chatId, state.userId);
        clients.forEach(client => {
          client.send(JSON.stringify({message}));
        });
      } else {
        state.userId = await User.authenticate(data.token);
        const success = await socketsChache.connectToRoom(data.chatId, state, ws);
        ws.send(JSON.stringify({success}));
      }
    } catch(error) {
      console.log(error);
      ws.send(JSON.stringify({error}));
    }
  });

  ws.on('close', () => {
    socketsChache.disconnectFromRoom(state);
  });
}