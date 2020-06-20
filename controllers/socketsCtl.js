const WebSocket = require('ws');
const User = require('../models/User');

exports.connection = (ws, wss, socketsChache) => {
  const state = {
    authenticatedId: null,
    currentChatId: null
  }

  ws.on('message', async data => {
    data = JSON.parse(data);
    console.log(data);

    try {
      if(state.authenticatedId != null) {
        const success = await socketsChache.handleMessage(data.chatId, data.message, state, ws);
        ws.send(JSON.stringify({success}));
      } else {
        state.authenticatedId = await User.authenticate(data.token);
        ws.send(JSON.stringify({success: 'User authenticated.'}));
      }
    } catch(error) {
      ws.send(JSON.stringify({error}));
    }
  });

  ws.on('close', () => {
    console.log('Connection closed.');
  });
}