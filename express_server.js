const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString } = require('./helpers');
const app = express();
const PORT = 8080;

let users = {};
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

function urlsForUser(id) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
} 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.send("Please login or register first.");
    return;
  }
  const urls = urlsForUser(userId);
  const templateVars = {
    urls,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
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
  if (!userId) {
    res.send("Please login first.");
    return;
  }
  if (urlDatabase[shortURL].userID !== userId) {
    res.send("This URL does not belong to you.");
    return;
  }
  res.render("urls_show", { shortURL, longURL: urlDatabase[shortURL].longURL });
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  if (!userId) {
    res.send("Please login first.");
    return;
  }
  if (urlDatabase[shortURL].userID !== userId) {
    res.send("This URL does not belong to you.");
    return;
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  if (!userId) {
    res.send("Please login first.");
    return;
  }
  if (urlDatabase[shortURL].userID !== userId) {
    res.send("This URL does not belong to you.");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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