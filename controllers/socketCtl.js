const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

exports.connection = (ws, req, wss) => {
  const user = {
    authorizedChats: [],
    userId: false
  }

  ws.on('message', async data => {
    data = JSON.parse(data);

    if(data.type == 'auth') {
      try {
        const userId = jwt.verify(data.token, process.env.JWTSECRET, (err, decoded) => {
          if(err) {
            throw 'Invalid token';
          }
          return decoded._id;
        });
        await User.findById(userId);
        user.userId = userId;
      } catch(err) {
        ws.send(err);
      }
    }

    if(data.type == 'join') {
      
    }

    if(data.type == 'msg') {
      
    }
  });
}