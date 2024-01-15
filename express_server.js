const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

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
  for(let url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
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