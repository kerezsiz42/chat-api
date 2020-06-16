const usersCollection = require('../db').db().collection('users');
const chatsCollection = require('../db').db().collection('chats');
// try the same with regular expressions in the future
const validator = require('validator');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;

class User {
  static validateUsername(username) {
    return new Promise(async (resolve, reject) => {
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
      resolve(errors);
    });
  }

  static validatePassword(password) {
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
  
  static validateEmail(email) {
    return new Promise(async (resolve, reject) => {
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
      resolve(errors);
    });
  }

  static cleanUp(data) {
    let { username, email, password } = data;
    if(typeof(username) != 'string') {
      username = '';
    }
    if(typeof(email) != 'string') {
      email = '';
    }
    if(typeof(password) != 'string') {
      password = '';
    }
    username.trim();
    email.trim().toLowerCase();
    return {
      username,
      email,
      password
    }
  }

  static register(data) {
    return new Promise(async (resolve, reject) => {
      let errors = [];
      data = this.cleanUp(data);
      errors = errors.concat(this.validatePassword(data.password));
      errors = errors.concat(await this.validateEmail(data.email));
      errors = errors.concat(await this.validateUsername(data.username));
      
      if(!errors.length) {
        data.password = bcrypt.hashSync(data.password, 10);
        await usersCollection.insertOne(data);
        resolve('Successfully registered user.');
      } else {
        reject(errors);
      }
    });
  }

  static login(data) {
    return new Promise(async (resolve, reject) => {
      data = this.cleanUp(data);
      try {
        const attemptedUser = await usersCollection.findOne({$or: [{username: data.username}, {email: data.email}]});
        if(attemptedUser && bcrypt.compareSync(data.password, attemptedUser.password)) {
          attemptedUser.password = undefined;
          resolve(attemptedUser);
        } else {
          reject('Invalid username or password.');
        }
      } catch {
        reject('Please try again later.');
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
          reject('User does not exist.');
        }
      } catch {
        reject('Please try again later.');
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
          reject('User not found.');
        }
      } catch {
        reject('Please try again later.');
      }
    });
  }

  static delete(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await usersCollection.deleteOne({_id: new ObjectID(userId)});
        if(result.deletedCount) {
          resolve('Successfully deleted user.');
        } else {
          reject('Error while trying to delete user.');
        }
      } catch {
        reject('Please try again later.');
      }
    });
  }
  
  static changeUsername(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if(typeof(data.newUsername) != 'string') {
          data.newUsername = '';
        }
        data.newUsername.trim();
        const errors = await this.validateUsername(data.newUsername);
        if(!errors.length) {
          await usersCollection.updateOne(
            {_id: new ObjectID(data.userId)},
            {$set: {username: data.newUsername}}
          );
          resolve('Username changed.');
        } else {
          reject(errors);
        }
      } catch {
        reject('Please try again later.');
      }
    });
  }

  static changePassword(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if(typeof(data.newPassword) != 'string') {
          data.newPassword = '';
        }
        const errors = this.validatePassword(data.newPassword);
        if(!errors.length) {
          data.newPassword = bcrypt.hashSync(data.newPassword, 10);
          await usersCollection.updateOne(
            {_id: new ObjectID(data.userId)},
            {$set: {password: data.newPassword}}
          );
          resolve('Password changed.');
        } else {
          reject(errors);
        }
      } catch {
        reject('Please try again later.');
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
        reject('Please try again later.');
      }
    });
  }
}

module.exports = User;