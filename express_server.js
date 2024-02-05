const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString, urlsForUser, checkUserAccess, getUrlsForUser } = require('./helpers');
const { users, urlDatabase } = require('./database');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

// Your urlDatabase and users objects go here

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  // If the user is not logged in, redirect to the login page
  if (!userId) {
    return res.redirect("/login");
  }

  // Get the URLs for the logged-in user
  const userUrls = getUrlsForUser(userId);

  // Get the user object
  const user = users[userId];

  // Render the URLs page with the URLs for the logged-in user and the user object
  res.render("urls_index", { urls: userUrls, user: user });
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const accessError = checkUserAccess(userId, shortURL, urlDatabase);
  if (accessError) {
    res.status(accessError.status).send(accessError.message);
  } else {
    if (!urlDatabase[shortURL]) {
      res.status(404).send("URL not found");
    } else {
      const url = urlDatabase[shortURL];
      res.render("urls_show", { shortURL: shortURL, longURL: url.longURL, user: users[userId] });
    }
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (url) {
    res.redirect(url.longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const accessError = checkUserAccess(userId, shortURL);
  if (accessError) {
    res.status(accessError.status).send(accessError.message);
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;

  const accessCheck = checkUserAccess(userId, shortURL, urlDatabase);
  if (accessCheck) {
    res.status(accessCheck.status).send(accessCheck.message);
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.send("Please login first.");
    return;
  }
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      return console.log(err);
    }
    res.redirect("/urls");
  });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 
  const hashedPassword = bcrypt.hashSync(password, 10); 


  // Check if email is already in use
  for (let userId in users) {
    if (users[userId].email === email) {
      res.status(400).send('Email already in use');
      return;
    }
  }

  // Create a new user and store it in the users database
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  // Set the user_id cookie
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password is incorrect");
  }
}); 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});