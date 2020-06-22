const Chat = require("./Chat");

class Sockets {
  constructor() {
    this.data = {};
  }

  connectToRoom(chatId, ws) {
    return new Promise(async (resolve, reject) => {
      try {
        await Chat.isMember(ws.userId, chatId);
        if(!this.data.hasOwnProperty(chatId)) {
          this.data[chatId] = {};
        }
        this.data[chatId][ws.userId] = ws;
        ws.chatId = chatId;
        resolve('Client connected.');
      } catch(err) {
        reject(err);
      }
    });
  }

  isChatEmpty(chatId) {
    try {
      for(const property in this.data[chatId]) {
        if(this.data[chatId].hasOwnProperty(property)) {
          return false;
        }
      }
      return true;
    } catch(err) {
      console.log(err)
    }
  }

  disconnectFromRoom(ws) {
    try {
      delete this.data[ws.chatId][ws.userId];
      if(this.isChatEmpty(ws.chatId)) {
        delete this.data[ws.chatId];
      }
      ws.chatId = null;
    } catch (err) {
      console.log(err);
    }
  }

  handleMessage(chatId, payload, ws) {
    return new Promise(async (resolve, reject) => {
      try {
        if(payload == undefined || payload == '') {
          reject('No payload.');
        }
        if(ws.chatId != chatId) {
          this.disconnectFromRoom(ws);
          await this.connectToRoom(chatId, ws);
        }
        const message = await Chat.addMessage(ws.userId, ws.chatId, payload);
        resolve(message);
      } catch(err) {
        reject(err);
      }
    });
  }

  getClientsInRoom(chatId) {
    try {
      const clients = [];
      for(const userId in this.data[chatId]) {
        clients.push(this.data[chatId][userId]);
      }
      return clients;
    } catch(err) {
      console.log(err);
    }
  }
}

module.exports = Sockets;