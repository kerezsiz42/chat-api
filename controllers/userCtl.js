const User = require('../models/User');
const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const success = await User.register(req.body);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
};

exports.gate = async (req, res, next) => {
  try {
    if(req.body.token) {
      req.body.userId = await User.authenticate(req.body.token);
      next();
    } else {
      req.body = await User.login(req.body);
      res.json({token: jwt.sign({_id: req.body._id}, process.env.JWTSECRET, {expiresIn: '7d'})});
    }
  } catch(error) {
    res.json({error});
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const chatIds = await Chat.getChatsOfUser(req.body.userId);
    await chatIds.forEach(chat => {
      Chat.leave(req.body.userId, chat._id).then(membersSize => {
        if(!membersSize) {
          Chat.delete(chat._id);
        }
      }).catch(error => {
        throw error;
      });
    });
    const success = await User.delete(req.body.userId);
    res.json({success});
  } catch(error) {
    res.json({error});
  }
}

exports.changeUsername = async (req, res) => {
  try {
    const success = await User.changeUsername(req.body.userId, req.body.newUsername);
    res.json({success});
  } catch(error) {
    res.json({error})
  }
}

exports.changePassword = async (req, res) => {
  try {
    const success = await User.changePassword(req.body.userId, req.body.newPassword);
    res.json({success});
  } catch(error) {
    res.json({error})
  }
}

exports.searchByUsername = async (req, res) => {
  try {
    const success = await User.searchByUsername(req.body.searchTerm);
    res.json({success});
  } catch(error) {
    res.json({error})
  }
}

exports.findById = async (req, res) => {
  try {
    const success = await User.findById(req.body.otherUserId);
    res.json({success});
  } catch(error) {
    res.json({error})
  }
}