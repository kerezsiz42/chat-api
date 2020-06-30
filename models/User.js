const usersCollection = require('../db').db().collection('users');
const chatsCollection = require('../db').db().collection('chats');
const validator = require('validator');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');

class User {
  static async validateUsername(username) {
    if(typeof(username) != 'string') {
      username = '';
    }
    const errors = [];
    if(username != '' && username.length < 4) {
      errors.push('Username should be at least 4 characters long.');
    }
    if(username.length > 30) {
      errors.push('Username cannot exceed length of 30 characters.');
    }
    if(username == '') {
      errors.push('You must provide a username.');
    }
    if(username != '' && !validator.isAlphanumeric(username)) {
      errors.push('Username can contain only letters and numbers.');
    }
    if(username.length > 2 && username.length < 31 && validator.isAlphanumeric(username)) {
      const usernameExists = await usersCollection.findOne({username});
      if(usernameExists) {
        errors.push('This username is already taken.');
      }
    }
    return errors;
  }

  static validatePassword(password) {
    if(typeof(password) != 'string') {
      password = '';
    }
    const errors = [];
    if(password == '') {
      errors.push('You must provide a password.');
    }
    if(password != '' && password.length < 8) {
      errors.push('Password should be at least 8 characters long.');
    }
    if(password.length > 50) {
      errors.push('Password cannot exceed length of 50 characters.');
    }
    return errors;
  }
  
  static async validateEmail(email) {
    if(typeof(email) != 'string') {
      email = '';
    }
    const errors = [];
    if(validator.isEmail(email)) {
      const emailExists = await usersCollection.findOne({email});
      if(emailExists) {
        errors.push('This email is already in use.');
      }
    }
    if(!validator.isEmail(email)) {
      errors.push('You must provide a valid email.');
    }
    return errors;
  }
  
  static register(data) {
    return new Promise(async (resolve, reject) => {
      let errors = [];
      errors = errors.concat(this.validatePassword(data.password));
      errors = errors.concat(await this.validateEmail(data.email));
      errors = errors.concat(await this.validateUsername(data.username));
      
      if(!errors.length) {
        data.password = bcrypt.hashSync(data.password, 10);
        await usersCollection.insertOne(data);
        resolve(['Successfully registered user.']);
      } else {
        reject(errors);
      }
    });
  }

  static login(username, email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const attemptedUser = await usersCollection.findOne({$or: [{username}, {email}]});
        if(attemptedUser && bcrypt.compareSync(password, attemptedUser.password)) {
          resolve(attemptedUser._id);
        } else {
          reject(['Invalid username or password.']);
        }
      } catch {
        reject(['Error inside User.login().']);
      }
    });
  }

  static findByUsername(username) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await usersCollection.findOne(
          {username},
          {projection: {password: 0}}
        );
        if(user) {
          resolve(user._id.toString());
        } else {
          reject(['User does not exist.']);
        }
      } catch {
        reject(['Error inside User.findByUsername().']);
      }
    });
  }

  static findById(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await usersCollection.findOne(
          {_id: new ObjectID(userId)},
          {projection: {password: 0}}
        );
        if(user) {
          resolve(user);
        } else {
          reject(['User not found.']);
        }
      } catch {
        reject(['Error inside User.findById().']);
      }
    });
  }

  static delete(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await usersCollection.deleteOne({_id: new ObjectID(userId)});
        if(result.deletedCount) {
          resolve(['Successfully deleted user.']);
        } else {
          reject(['Error while trying to delete user.']);
        }
      } catch {
        reject(['Error inside User.delete().']);
      }
    });
  }
  
  static changeUsername(userId, newUsername) {
    return new Promise(async (resolve, reject) => {
      try {
        // Sanitize?
        const errors = await this.validateUsername(newUsername);
        if(!errors.length) {
          await usersCollection.updateOne(
            {_id: new ObjectID(userId)},
            {$set: {username: newUsername}}
          );
          resolve(['Username changed.']);
        } else {
          reject(errors);
        }
      } catch {
        reject(['Error inside User.changeUsername().']);
      }
    });
  }

  static changePassword(userId, newPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        const errors = this.validatePassword(newPassword);
        if(!errors.length) {
          newPassword = bcrypt.hashSync(newPassword, 10);
          await usersCollection.updateOne(
            {_id: new ObjectID(userId)},
            {$set: {password: newPassword}}
          );
          resolve(['Password changed.']);
        } else {
          reject(errors);
        }
      } catch {
        reject(['Error inside User.changePassword().']);
      }
    });
  }

  static searchByUsername(searchTerm) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create index for usernames manually if it does not exists in DB
        const result = await usersCollection.aggregate([
          {$match: {username: {$regex: new RegExp(searchTerm)}}},
          {$sort: {username: 1}},
          {$limit: 10},
          {$project: {password: 0, email: 0}}
        ]).toArray();
        resolve(result);
      } catch {
        reject(['Error inside User.searchByUsername().']);
      }
    });
  }

  static authenticate(token) {
    return new Promise(async (resolve, reject) => {
      try {
        const userId = jwt.verify(token, process.env.JWTSECRET, (error, decoded) => {
          if(error) {
            reject(['Invalid token']);
          }
          return decoded._id;
        });
        await User.findById(userId);
        resolve(userId);
      } catch {
        reject(['Error inside User.authenticate().']);
      }
    });
  }
}

module.exports = User;