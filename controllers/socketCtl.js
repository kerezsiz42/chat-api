const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');


exports.connection = (ws, req, wss) => {
  const state = {
    chatIds: [],
    userId: false
  }

  ws.on('message', async data => {
    data = JSON.parse(data);

    if(data.type == 'auth') {
      try {
        state.userId = await User.authenticate(data.token);
        ws.send(JSON.stringify({success: `${state.userId} authenticated.`}));
        console.log(`${state.userId} authenticated.`);
      } catch(error) {
        ws.send(JSON.stringify({error}));
        ws.terminate();
      }
    }

    if(data.type == 'join' && state.userId && !state.chatIds.includes(data.chatId)) {
      try {
        await Chat.isMember(data.userId, data.chatId);
        state.chatIds.push(data.chatId);
        ws.send(JSON.stringify({success: `${state.userId} joined ${state.chatIds[state.chatIds.length-1]}`}));
        console.log(`${state.userId} joined ${state.chatIds[state.chatIds.length-1]}`);
      } catch(error) {
        ws.send(JSON.stringify({error}));
      }
    }

    if(data.type == 'msg') {
      try {

      } catch(error) {
        ws.send(JSON.stringify({error}));
      }
    }
  });
}