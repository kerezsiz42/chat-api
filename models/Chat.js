const chatsCollection = require('../db').db().collection('chats');
const ObjectID = require('mongodb').ObjectID;
const validator = require('validator');

class Chat {
  static create(chatName, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const errors = await this.validateChatName(newChatName);
        if(!errors.length) {
          const chat = {
            // Sanitize
            chatName,
            members: [new ObjectID(userId)],
            messages: [],
            time: new Date()
          }
          await chatsCollection.insertOne(chat);
          resolve(['New chat room created.']);
        } else {
          reject(errors);
        }
      } catch {
        reject(['Error inside Chat.create().']);
      }
    });
  }

  static async validateChatName(chatName) {
    const errors = [];
    if(chatName != '' && chatName.length < 4) {
      errors.push('Chat name should be at least 4 characters long.');
    }
    if(chatName.length > 30) {
      errors.push('Chat name cannot exceed length of 30 characters.');
    }
    if(chatName == '') {
      errors.push('You must provide a chat name.');
    }
    if(chatName != '' && !validator.isAlphanumeric(chatName)) {
      errors.push('Chat name can contain only letters and numbers.');
    }
    if(chatName.length > 2 && chatName.length < 31 && validator.isAlphanumeric(chatName)) {
      const chatNameExists = await chatsCollection.findOne({chatName});
      if(chatNameExists) {
        errors.push('This chat name is already taken.');
      }
    }
    return errors;
  }

  static delete(chatId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await chatsCollection.deleteOne(
          {_id: new ObjectID(chatId)}
        );
        if(result.deletedCount) {
          resolve(['Deleted chat room.']);
        } else {
          reject(['Error while deleting chat room.']);
        }
      } catch {
        reject(['Error inside Chat.delete().']);
      }
    });
  }

  static addUser(userId, chatId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await chatsCollection.updateOne(
          {_id: new ObjectID(chatId)},
          {$addToSet: {members: new ObjectID(userId)}}
        );
        if(result.modifiedCount) {
          resolve(['New user added to chat room.']);
        } else {
          reject(['User is already a member of that chat room.']);
        }
      } catch {
        reject(['Error inside Chat.addUser().']);
      }
    });
  }

  static leave(userId, chatId) {
    return new Promise(async (resolve, reject) => {
      try {
        const chat = await chatsCollection.findOneAndUpdate(
          {_id: new ObjectID(chatId)},
          {$pull: {members: new ObjectID(userId)}},
          {returnOriginal: false}
        );
        if(chat.value) {
          resolve(chat.value.members.length);
        } else {
          reject(['You are not member of that chat room.']);
        }
      } catch {
        reject(['Error inside Chat.leave().']);
      }
    });
  }

  static isMember(userId, chatId) {
    return new Promise(async (resolve, reject) => {
      try {
        const chat = await chatsCollection.findOne(
          {_id: new ObjectID(chatId), members: new ObjectID(userId)},
          {projection: {messages: 0}}
        );
        if(chat) {
          resolve(['User is part of this chat.']);
        } else {
          reject(['You have no permission to access this chat room.']);
        }
      } catch {
        reject(['Error inside Chat.isMember().']);
      }
    });
  }

  static getChatsOfUser(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const array = await chatsCollection.find(
          {members: new ObjectID(userId)},
          {projection: {messages: 0}}
        ).toArray();
        resolve(array);
      } catch {
        reject(['Error inside Chat.getChatsOfUser().']);
      }
    })
  }

  static findById(chatId) {
    return new Promise(async (resolve, reject) => {
      try {
        const chat = await chatsCollection.findOne(
          {_id: new ObjectID(chatId)},
          {projection: {messages: 0}}
        );
        if(chat) {
          resolve(chat);
        } else {
          reject(['Chat not found.']);
        }
      } catch {
        reject(['Error inside Chat.findById().']);
      }
    });
  }

  static addMessage(userId, chatId, message) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          userId: new ObjectID(userId),
          // Sanitize
          msg: message,
          time: new Date().getTime()
        }
        const result = await chatsCollection.updateOne(
          {_id: new ObjectID(chatId)},
          {$push: {messages: data}}
        );
        if(result.modifiedCount) {
          resolve(data);
        } else {
          reject(['Error while trying to save message.']);
        }
      } catch {
        reject(['Error inside Chat.addMessage().']);
      }
    });
  }

  static loadLastMessages(chatId, messageCount, messageTime) {
    return new Promise(async (resolve, reject) => {
      try {
        const chat = await chatsCollection.findOne(
          {_id: new ObjectID(chatId)}
        );
        const length = chat.messages.length;
        if(messageCount > length) {
          reject(['Invalid input.']);
        }
        if(messageCount == undefined) {
          messageCount = 1;
        }
        if(messageTime == undefined) {
          resolve(chat.messages.slice(length - messageCount, length));
        } else {
          // MessageTime is time of the message we want to retrieve messages before.
          messageTime = new Date(parseInt(messageTime)).getTime();
          let index = -1;
          for(let i = length - 1; i >= 0 && index == -1; i--) {
            if(chat.messages[i].time == messageTime) {
              index = i;
            }
          }
          if(messageCount > index || index == -1) {
            reject(['Invalid input.']);
          }
          resolve(chat.messages.slice(index - messageCount, index));
        }
      } catch {
        reject(['Error inside Chat.loadLastMessages().']);
      }
    });
  }

  static changeChatName(chatId, newChatName) {
    return new Promise(async (resolve, reject) => {
      try {
        // Sanitize?
        if(typeof(newChatName) != 'string') {
          newChatName = '';
        }
        newChatName.trim();
        const errors = await this.validateChatName(newChatName);
        if(!errors.length) {
          await chatsCollection.updateOne(
            {_id: new ObjectID(chatId)},
            {$set: {chatName: newChatName}}
          );
          resolve(['Chat name changed.']);
        } else {
          reject(errors);
        }
      } catch {
        reject(['Error inside Chat.changeChatName().']);
      }
    });
  }
}

module.exports = Chat;