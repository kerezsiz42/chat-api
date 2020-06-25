const express = require('express');
const server = express();
const wss = require('express-ws')(server);
const socketCtl = require('./controllers/socketsCtl');
const Sockets = require('./models/Sockets');
const cors = require('cors');

server.use(cors());
server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use('/', require('./router'));

const sockets = new Sockets(); 

server.ws('/', ws => {
  ws.userId = null;
  ws.isAlive = true;

  ws.on('message', data => socketCtl.onmessage(data, ws, sockets));
  ws.on('pong', () => socketCtl.onpong(ws));
  ws.on('close', () => socketCtl.onclose(ws, sockets));
});

socketCtl.pingInterval(wss.getWss());

module.exports = server;