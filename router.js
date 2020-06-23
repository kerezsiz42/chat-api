const router = require('express').Router();
const userCtl = require('./controllers/userCtl');
const chatCtl = require('./controllers/chatCtl');

router.all('/', (req, res) => {
  res.json('Welcome to Wirebird\'s chat API. Use POST methods to communicate with this server.');
});

router.get('/socket', (req, res) => {
  res.sendFile(__dirname+'/socket.html');
});

// User related
router.post('/register', userCtl.register);
router.post('/login', userCtl.gate);
router.post('/deleteAccount', userCtl.gate, userCtl.deleteUser);
router.post('/changeUsername', userCtl.gate, userCtl.changeUsername);
router.post('/changePassword', userCtl.gate, userCtl.changePassword);
router.post('/searchUsers', userCtl.gate, userCtl.searchByUsername);
router.post('/findUserById', userCtl.gate, userCtl.findById);

// Chat related
router.post('/createChat', userCtl.gate, chatCtl.createChat);
router.post('/addUserToChat', userCtl.gate, chatCtl.isMember, chatCtl.addUser);
router.post('/leaveChat', userCtl.gate, chatCtl.removeUser);
router.post('/myChats', userCtl.gate, chatCtl.getChatsOfUser);
router.post('/loadLastMessages', userCtl.gate, chatCtl.isMember, chatCtl.loadLastMessages);
router.post('/sendMessage', userCtl.gate, chatCtl.isMember, chatCtl.sendMessage);
router.post('/changeChatName', userCtl.gate, chatCtl.isMember, chatCtl.changeChatName);
router.post('/findChatById', userCtl.gate, chatCtl.findById);

module.exports = router;