const Chat = require("./Chat");

class Sockets {
  connectToRoom(chatId, userId, ws) {
    this[chatId][userId] = ws;
  }

  isChatEmpty(chatId) {
    for(prop in this[chatId]) {
      if(this[chatId].hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  }

  disconnectFromRoom(chatId, userId) {
    delete this[chatId][userId];
    if(this.isChatEmpty(chatId)) {
      delete this[chatId];
    }
  }

  handleMessage(chatId, message, state, ws) {
    return new Promise(async (resolve, reject) => {
      try {
        if(state.currentChatId != chatId) {
          if(state.currentChatId != null) {
            this.disconnectFromRoom(state.currentChatId, state.authenticatedId);
          }
          await Chat.isMember(state.authenticatedId, chatId);
          this.connectToRoom(chatId, state.authenticatedId, ws);
        }
        /* Save message in database and send to others in chatroom. */
        await Chat.addMessage(state.authenticatedId, state.currentChatId, message);
        // Send to others
        resolve('Message sent.');
      } catch(err) {
        reject(err);
      }
    });
  }

  sendToOthers(chatId, excludedUserId, message) {

  }
}

module.exports = Sockets;