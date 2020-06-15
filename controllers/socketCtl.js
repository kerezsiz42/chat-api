const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const handleMessage = () => {

}

const connectUserToChat = (token, chatId) => {
  const data = jwt.verify(token, process.env.JWTSECRET);
  console.log(data._id);
}

exports.connection = (ws, req, wss) => {
  ws.on('message', (data) => {
    data = JSON.parse(data);
    if(data.type == 'auth') {
      connectUserToChat(data.token, 'chatId');
    } else if(data.type == 'msg') {
      handleMessage();
    } else {
      ws.terminate();
    }
  });
}