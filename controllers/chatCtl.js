const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
  try {
    const success = await Chat.create(req.body.chatName, req.body.userId);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}

exports.addUser = async (req, res) => {
  try {
    const success = await Chat.addUser(req.body.otherUserId, req.body.chatId);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}

exports.isMember = async (req, res, next) => {
  try {
    await Chat.isMember(req.body.userId, req.body.chatId);
    next();
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
    const success = await Chat.getChatsOfUser(req.body.userId);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}

exports.loadLastMessages = async (req, res) => {
  try {
    const success = await Chat.loadLastMessages(req.body.chatId, req.body.messageCount, req.body.messageTime);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}

exports.sendMessage = async (req, res) => {
  try {
    await Chat.addMessage(req.body.userId, req.body.chatId, req.body.message);
    res.json({success: 'Message saved.'});
  } catch(error) {
    res.json({error});
  }
}

exports.changeChatName = async (req, res) => {
  try {
    const success = await Chat.changeChatName(req.body.chatId, req.body.newChatName);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}

exports.findById = async (req, res) => {
  try {
    const success = await Chat.findById(req.body.chatId);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}