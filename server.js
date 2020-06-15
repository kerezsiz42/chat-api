const express = require('express');
const server = express();
const wss = require('express-ws')(server);
const socketCtl = require('./controllers/socketCtl');

server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use('/', require('./router'));

server.ws('/', (ws, req) => socketCtl.connection(ws, req, wss));

module.exports = server;