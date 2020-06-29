# Wirebird's Chat API
The main goal is to create an open-source chat Api that anyone can use and deploy at their own server within minutes using Docker.
# Installation
Create a .env file which contains the following fields:
```
CONNECTIONSTRING=your_mongodb_connection_string
PORT=80
JWTSECRET=your_jwt_secret
```
Then pull image from dockerhub:
```
sudo docker pull zoltankerezsi/chat-api
```
Then run with the environment variables you have specified:
```
sudo docker run -it --env-file ./.env -p 80:80 zoltankerezsi/chat-api
```
# Usage
Endpoints are ordered into two distinguished sets, one that is concerned with the interactions of users, and one with chat rooms or conversations.

All requests should use POST method and JSON. For this reason let us create a reusable function:
```js
const fetchServer = (endpoint, params) => {
  return fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(params)
  }).then(response => response.json());
}
```
## User related
### Register
```js
const register = (username, email, password) => {
  fetchServer('/register', {username, email, password})
    .then(data => {
      /* {token: tokenString} */
    })
    .catch(error => {
      /* {error: ['Validation errors.']} */
    });
}
```
### Login/Gate
```js
const login = (username, email, password) => {
  /* You can log in either with username or email plus the correct password */
  fetchServer('/login', {username, email, password})
    .then(data => {
      /* {token: tokenString} */
    })
    .catch(error => {
      /* {error: 'Invalid username or password.'} */
    });
}
```
__For all the following requests you should send a valid token which also contains your user id. In case you provide an invalid token the gate middleware will terminate further execution and retrieve an {error: 'Invalid token'} message.__
### Delete account
This request does also log the user out of each chat it is part of.
```js
const deleteAccount = (token) => {
  fetchServer('/deleteAccount', {token})
    .then(data => {
      /* {success: 'Successfully deleted user.'} */
    })
    .catch(error => {
      /* {error: error} */
    });
}
```
### Change username
```js
const changeUsername = (token, newUsername) => {
  fetchServer('/changeUsername', {token, newUsername})
    .then(data => {
      /* {success: 'Username changed.'} */
    })
    .catch(error => {
      /* {error: ['Validation errors.']} */
    });
}
```
### Change password
Passwords are hashed with bcrypt.
```js
const changePassword = (token, newPassword) => {
  fetchServer('/changePassword', {token, newPassword})
    .then(data => {
      /* {success: 'Password changed.'} */
    })
    .catch(error => {
      /* {error: ['Validation errors.']} */
    });
}
```
### Search users
```js
const searchUsers = (token, searchTerm) => {
  fetchServer('/searchUsers', {token, searchTerm})
    .then(data => {
      /* {success: ['Array of user objects without password.']} */
    })
    .catch(error => {
      /* {error: 'Please try again later.'} */
    });
}
```
### Find user by id
```js
const findUserById = (token, otherUserId) => {
  fetchServer('/findUserById', {token, otherUserId})
    .then(data => {
      /* {success: 'User object without password.'} */
    })
    .catch(error => {
      /* {error: 'User not found.'} */
    });
}
```
## Chat related
### Create chat
```js
const createChat = (token, newChatName) => {
  fetchServer('/createChat', {token, newChatName})
    .then(data => {
      /* {success: 'New chat room created.'} */
    })
    .catch(error => {
      /* {error: ['Validation errors.']} */
    });
}
```
### Add user to chat
Every user can add others to any chat room they are member of.
```js
const addUserToChat = (token, chatId, otherUserId) => {
  fetchServer('/addUserToChat', {token, chatId, otherUserId})
    .then(data => {
      /* {success: 'New user added to chat room.'} */
    })
    .catch(error => {
      /* {error: error} */
    });
}
```
### Leave chat
If you leave a chat room that had no user other than you, then it gets automatically deleted.
```js
const leaveChat = (token, chatId) => {
  fetchServer('/leaveChat', {token, chatId})
    .then(data => {
      /* {success: 'Removed user from chat room.'} */
    })
    .catch(error => {
      /* {error: error} */
    });
}
```
### My chats
This function could also be used to test if the token that was saved in local storage is still valid. If it is not valid, then you get {error: 'Invalid token'}.
```js
const myChats = (token) => {
  fetchServer('/myChats', {token})
    .then(data => {
      /* {success: ['Array of chats without message data.']} */
    })
    .catch(error => {
      /* {error: error} */
    });
}
```
### Load last messages
Message count and message time are optional parameters. This function retrieves messageCount number of messages before the message with the exact time messageTime if there are such. This is very helpful when the user is scrolling up in chat history. If you don't specify messageCount and messageTime then you get the last message in that chat room.
```js
const loadLastMessages = (token, chatId, messageCount, messageTime) => {
  fetchServer('/loadLastMessages', {token, chatId, messageCount, messageTime})
    .then(data => {
      /* {success: ['Array of messages.']} */
    })
    .catch(error => {
      /* {error: error} */
    });
}
```
### Send message
```js
const sendMessage = (token, chatId, message) => {
  fetchServer('/sendMessage', {token, chatId, message})
    .then(data => {
      /* {success: 'Message saved.'} */
    })
    .catch(error => {
      /* {error: error} */
    });
}
```
### Change chat name
```js
const changeChatName = (token, chatId, newChatName) => {
  fetchServer('/changeChatName', {token, chatId, newChatName})
    .then(data => {
      /* {success: 'Chat name changed.'} */
    })
    .catch(error => {
      /* {error: ['Validation errors.']} */
    });
}
```
### Find chat by id
```js
const findChatById = (token, chatId) => {
  fetchServer('/findChatById', {token, chatId})
    .then(data => {
      /* {success: 'Chat data without messages'} */
    })
    .catch(error => {
      /* {error: 'Chat not found.'} */
    });
}
```

## Websocket
Working on it...