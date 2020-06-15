const chatsCollection = require('../db').db().collection('chats');
const ObjectID = require('mongodb').ObjectID;

class Chat {
  static create(chatName, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const isNameExisting = await chatsCollection.findOne({chatName});
        if(isNameExisting) {
          reject('Chat room with the same name already exists.');
        } else {
          const chat = {
            chatName,
            members: [new ObjectID(userId)],
            messages: [],
            time: new Date()
          }
          await chatsCollection.insertOne(chat);
          resolve('New chat room created.');
        }
      } catch(err) {
        reject(err);
      }
    });
  }

  static delete(chatId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await chatsCollection.deleteOne(
          {_id: new ObjectID(chatId)}
        );
        if(result.deletedCount) {
          resolve('Deleted chat room.');
        } else {
          reject('Error while deleting chat room.');
        }
      } catch {
        reject('Please try again later.');
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
          resolve('New user added to chat room.');
        } else {
          reject('User is already a member of that chat room.');
        }
      } catch {
        reject('Please try again later.');
      }
    });
  }

  static leave(userId, chatId) {
    return new Promise(async (resolve, reject) => {
      try {

        //Rethink
        const chat = await chatsCollection.findOneAndUpdate(
          {_id: new ObjectID(chatId)},
          {$pull: {members: new ObjectID(userId)}},
          {returnOriginal: false}
        );
        console.log(chat);
        if(chat.value) {
          resolve(chat.value.members.length);
        } else {
          reject('User is not a member of that chat room.');
        }
      } catch {
        reject('Please try again later.');
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
          resolve('User is part of this chat.');
        } else {
          reject('You have no permission to modify members of this chat room.');
        }
      } catch {
        reject('Please try again later.');
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
        reject('Please try again later.');
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
          reject('Chat not found.');
        }
      } catch {
        reject('Please try again later.');
      }
    });
  }

  static showMessagesBetweenDates(chatId, firstDate, lastDate) {

  }

  static addMessage(userId, chatId, message) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          userId: new ObjectID(userId),
          msg: message,
          time: new Date()
        }
        const result = await chatsCollection.updateOne(
          {_id: new ObjectID(chatId)},
          {$push: {messages: data}}
        );
        if(result.updatedCount) {
          resolve('Added new message.');
        } else {
          reject('Error while trying to save message.');
        }
      } catch {
        reject('Please try again later.');
      }
    });
  }
}

module.exports = Chat;