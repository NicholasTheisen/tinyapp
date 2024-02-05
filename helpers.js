const { urlDatabase } = require('./database');
const { users } = require('./database');


const getUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = (id) => {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

const getUrlsForUser = (id) => {
  let urlsForUser = {};
  for(let url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      urlsForUser[url] = urlDatabase[url];
    }
  }
  return urlsForUser;
};

const checkUserAccess = (userId, shortURL, urlDatabase) => {
  if (!userId) {
    return { status: 403, message: "Please log in." };
  } else if (!urlDatabase || !urlDatabase[shortURL]) {
    return { status: 404, message: "URL not found." };
  } else if (urlDatabase[shortURL].userID !== userId) {
    return { status: 403, message: "Access denied." };
  }
  return null;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkUserAccess, getUrlsForUser };