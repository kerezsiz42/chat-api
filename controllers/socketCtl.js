const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

const handleToken = async (ws, state, token) => {
  try {
    state.userId = await User.authenticate(token);
    ws.send(JSON.stringify({success: `${state.userId} authenticated.`}));
    console.log(`${state.userId} authenticated.`);
  } catch(error) {
    console.log(error);
    ws.send(JSON.stringify({error}));
    ws.terminate();
  }
}

const handleMessage = async (ws, state, chatId, message) => {
  try {
    if(state.chatIds.includes(chatId)) {
      console.log(message);
    } else {
      await Chat.isMember(state.userId, chatId);
      state.chatIds.push(chatId);
      ws.send(JSON.stringify({success: `${state.userId} joined ${state.chatIds[state.chatIds.length-1]}`}));
      console.log(`${state.userId} joined ${state.chatIds[state.chatIds.length-1]}`);
    }
  } catch(error) {
    ws.send(JSON.stringify({error}));
  }
}

exports.connection = (ws, wss) => {
  const state = {
    chatIds: [],
    userId: false
  }

  ws.on('message', data => {
    data = JSON.parse(data);
    console.log(data);

    if(!state.userId) {
      handleToken(ws, state, data.token);
    } else {
      handleMessage(ws, state, data.chatId, data.message);
    }
  });
}