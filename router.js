const router = require('express').Router();
const userCtl = require('./controllers/userCtl');
const chatCtl = require('./controllers/chatCtl');

router.all('/', (req, res) => {
  //res.json('Welcome to chat-api.');
  res.sendFile(__dirname+'/index.html');
});

// User related
router.post('/register', userCtl.register);
router.post('/login', userCtl.gate);
router.post('/deleteAccount', userCtl.gate, userCtl.deleteUser);
router.post('/changeUsername', userCtl.gate, userCtl.changeUsername);
router.post('/changePassword', userCtl.gate, userCtl.changePassword);
router.post('/searchUsers', userCtl.gate, userCtl.searchByUsername);

// Chat related
router.post('/createChat', userCtl.gate, chatCtl.createChat);
router.post('/addUserToChat', userCtl.gate, chatCtl.addUser);
router.post('/leaveChat', userCtl.gate, chatCtl.removeUser);
router.post('/myChats', userCtl.gate, chatCtl.getChatsOfUser);

router.post('/loadLastMessages', userCtl.gate, chatCtl.loadLastMessages);
router.post('/sendMessage', userCtl.gate, chatCtl.sendMessage);

module.exports = router;