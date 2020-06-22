const express = require('express');
const server = express();
const wss = require('express-ws')(server);
const socketCtl = require('./controllers/socketsCtl');
const Sockets = require('./models/Sockets');

server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use('/', require('./router'));

const socketsChache = new Sockets(); 

server.ws('/', ws => socketCtl.connection(ws, socketsChache));

module.exports = server;