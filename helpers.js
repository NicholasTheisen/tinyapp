const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const { urlDatabase } = require('./database');

function urlsForUser(id) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

module.exports = { urlsForUser, getUserByEmail, generateRandomString };