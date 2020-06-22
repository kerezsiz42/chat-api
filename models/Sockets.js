const Chat = require("./Chat");

class Sockets {
  constructor() {
    this.data = {};
  }

  connectToRoom(chatId, state, ws) {
    return new Promise(async (resolve, reject) => {
      try {
        await Chat.isMember(state.userId, chatId);
        if(!this.data.hasOwnProperty(chatId)) {
          this.data[chatId] = {};
        }
        this.data[chatId][state.userId] = ws;
        state.chatId = chatId;
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

  disconnectFromRoom(state) {
    try {
      delete this.data[state.chatId][state.userId];
      if(this.isChatEmpty(state.chatId)) {
        delete this.data[state.chatId];
      }
      state.chatId = null;
    } catch (err) {
      console.log(err);
    }
  }

  handleMessage(chatId, payload, state, ws) {
    return new Promise(async (resolve, reject) => {
      try {
        if(payload == undefined || payload == '') {
          reject('No payload.');
        }
        if(state.chatId != chatId) {
          this.disconnectFromRoom(state);
          await this.connectToRoom(chatId, state, ws);
        }
        const message = await Chat.addMessage(state.userId, state.chatId, payload);
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