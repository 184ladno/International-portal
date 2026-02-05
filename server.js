const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // Change this in production
  resave: false,
  saveUninitialized: false
}));

// Simple in-memory user store (replace with database in production)
const users = [
  {
    username: 'admin',
    password: bcrypt.hashSync('password', 10) // Hashed password
  }
];

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.get('/dashboard', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.loggedIn = true;
    req.session.username = username;
    res.redirect('/');
  } else {
    res.send('Invalid credentials. <a href="/login">Try again</a>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.use(express.static(path.join(__dirname, 'public')));

// Return authentication status for client-side UI
app.get('/auth-status', (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn, username: req.session.username || null });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});