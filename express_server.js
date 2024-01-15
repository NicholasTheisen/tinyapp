const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

let users = {};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get ("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    res.send("Please login or register first.");
    return;
  }
  const urls = urlsForUser(userId);
  const templateVars = {
    urls,
    user: users[userId]
  };
  res.render("urls_index", { urls });
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
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
  const userId = generateRandomString(); // You need to implement this function
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  // Set the user_id cookie
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 

  // Find the user by email
  let userId;
  for (let id in users) {
    if (users[id].email === email) {
      userId = id;
      break;
    }
  }

  // If the user was not found, send a 403 error
  if (!userId) {
    res.status(403).send('Email not found');
    return;
  }

  const hashedPassword = users[userId].password;

  if (bcrypt.compareSync(password, hashedPassword)) {
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.status(403).send("Incorrect password");
  }
});