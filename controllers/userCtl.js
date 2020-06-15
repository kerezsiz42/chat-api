const User = require('../models/User');
const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.register();
    res.json({token: jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: '7d'})});
  } catch(error) {
    res.json({error});
  }
};

exports.gate = async (req, res, next) => {
  try {
    if(req.body.token) {
      req.body.userId = jwt.verify(req.body.token, process.env.JWTSECRET, (error, decoded) => {
        if(error) {
          throw 'Invalid token';
        }
        return decoded._id;
      });
      await User.findById(req.body.userId);
      next();
    } else {
      const user = new User(req.body);
      await user.login();
      res.json({token: jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: '7d'})});
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
    const result = await User.delete(req.body.userId);
    res.json({success: result});
  } catch(error) {
    res.json({error});
  }
}

exports.changeUsername = async (req, res) => {
  try {
    
  } catch(error) {
    res.json({error})
  }
}

exports.searchByUsername = async (req, res) => {
  try {

  } catch(error) {
    res.json({error})
  }
}