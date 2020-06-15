require('dotenv').config();
const mongodb = require('mongodb');

mongodb.connect(process.env.CONNECTIONSTRING, {useUnifiedTopology: true}, (err, client) => {
  module.exports = client;
  const server = require('./server');
  server.listen(process.env.PORT);
});