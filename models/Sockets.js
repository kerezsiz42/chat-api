const Chat = require("./Chat");

class Sockets {
  constructor() {
    this.data = {};
  }

  connectToRooms(ws) {
    return new Promise(async (resolve, reject) => {
      try {
        ws.chatIds = [];
        const chats = await Chat.getChatsOfUser(ws.userId);
        chats.forEach(chat => {
          ws.chatIds.push(chat._id.toString());
          if(!this.data.hasOwnProperty(chat._id)) {
            this.data[chat._id] = {};
          }
          this.data[chat._id][ws.userId] = ws;
        });
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

  disconnectFromRooms(ws) {
    try {
      ws.chatIds.forEach(chatId => {
        delete this.data[chatId][ws.userId];
        if(this.isChatEmpty(chatId)) {
          delete this.data[chatId];
        }
      });
      console.log(this.data);
    } catch (err) {
      // console.log(err);
    }
  }

  handleMessage(chatId, payload, ws) {
    return new Promise(async (resolve, reject) => {
      try {
        if(!ws.chatIds.includes(chatId)) {
          reject('Unauthorized or chat does not exist.');
        }
        if(payload == undefined || payload == '') {
          reject('No payload.');
        }
        const message = await Chat.addMessage(ws.userId, chatId, payload);
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