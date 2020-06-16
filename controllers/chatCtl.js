const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
  try {
    const result = await Chat.create(req.body.chatName, req.body.userId);
    res.json({success: result});
  } catch(error) {
    res.json({error});
  }
}

exports.addUser = async (req, res) => {
  try {
    console.log(req.body)
    await Chat.isMember(req.body.userId, req.body.chatId);
    const result = await Chat.addUser(req.body.otherUserId, req.body.chatId);
    res.json({success: result});
  } catch(error) {
    res.json({error});
  }
}

exports.removeUser = async (req, res) => {
  try {
    const membersSize = await Chat.leave(req.body.userId, req.body.chatId);
    if(!membersSize) {
      await Chat.delete(req.body.chatId);
    }
    res.json({success: 'Removed user from chat room.'});
  } catch(error) {
    res.json({error});
  }
}

exports.getChatsOfUser = async (req, res) => {
  try {
    const chatIds = await Chat.getChatsOfUser(req.body.userId);
    res.json({success: chatIds});
  } catch(error) {
    res.json({error});
  }
}

exports.loadLastMessages = async (req, res) => {
  try {
    const arrayOfMessages = await Chat.loadLastMessages(req.body.chatId, req.body.messageTime, req.body.messageCount);
    res.json({success: arrayOfMessages});
  } catch(error) {
    res.json({error});
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const success = await Chat.addMessage(req.body.userId, req.body.chatId, req.body.message);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}