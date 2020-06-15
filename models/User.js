const usersCollection = require('../db').db().collection('users');
const chatsCollection = require('../db').db().collection('chats');
const validator = require('validator');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;

class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  validate() {
    return new Promise(async (resolve, reject) => {
      if(this.data.username == '') {
        this.errors.push('You must provide a username.');
      }
      if(this.data.username != '' && !validator.isAlphanumeric(this.data.username)) {
        this.errors.push('Username can contain only letters and numbers.');
      }
      if(!validator.isEmail(this.data.email)) {
        this.errors.push('You must provide a valid email.');
      }
      if(this.data.password == '') {
        this.errors.push('You must provide a password.');
      }
      if(this.data.password != '' && this.data.password.length < 8) {
        this.errors.push('Password should be at least 8 characters long.');
      }
      if(this.data.password.length > 50) {
        this.errors.push('Password cannot exceed length of 50 characters.');
      }
      if(this.data.username != '' && this.data.username.length < 4) {
        this.errors.push('Username should be at least 4 characters long.');
      }
      if(this.data.username.length > 30) {
        this.errors.push('Username cannot exceed length of 30 characters.');
      }
      if(
          this.data.username.length > 2 &&
          this.data.username.length < 31 &&
          validator.isAlphanumeric(this.data.username)
        ) {
        const usernameExists = await usersCollection.findOne({username: this.data.username});
        if(usernameExists) {
          this.errors.push('This username is already taken.');
        }
      }
      if(validator.isEmail(this.data.email)) {
        const emailExists = await usersCollection.findOne({email: this.data.email});
        if(emailExists) {
          this.errors.push('This email is already in use.');
        }
      }
      resolve();
    });
  }

  cleanUp() {
    if(typeof(this.data.username) != 'string') {
      this.data.username = '';
    }
    if(typeof(this.data.email) != 'string') {
      this.data.email = '';
    }
    if(typeof(this.data.password) != 'string') {
      this.data.password = '';
    }
    this.data = {
      username: this.data.username.trim().toLowerCase(),
      email: this.data.email.trim().toLowerCase(),
      password: this.data.password
    }
  }

  register() {
    return new Promise(async (resolve, reject) => {
      this.cleanUp();
      await this.validate();
      if(!this.errors.length) {
        this.data.password = bcrypt.hashSync(this.data.password, 10);
        await usersCollection.insertOne(this.data);
        resolve('Successfully registered user.');
      } else {
        reject(this.errors);
      }
    });
  }

  login() {
    return new Promise(async (resolve, reject) => {
      this.cleanUp();
      try {
        const attemptedUser = await usersCollection.findOne({$or: [{username: this.data.username}, {email: this.data.email}]});
        if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
          this.data = attemptedUser;
          resolve('Successfully logged in.');
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
        console.log("hello")
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
}

module.exports = User;