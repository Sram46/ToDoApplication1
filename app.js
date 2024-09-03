const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const port = 3000;

// Dummy user data (use a database in real apps)
const users = [{ username: 'user1', password: 'pass1' }];

// Set up EJS for templating
app.set('view engine', 'ejs');

// Middleware to handle form data and sessions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: true }));
app.use(flash());

// Middleware to make flash messages accessible in views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Serve static files from "public" directory
app.use(express.static("public"));

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to view that page.');
  res.redirect('/login');
}

// In-memory task data (use a database in real apps)
let tasks = [
  { id: 1, description: 'Learn Node.js', completed: false },
  { id: 2, description: 'Build a To-Do app', completed: false }
];

// Routes
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    req.flash('error', 'Invalid credentials');
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/', ensureAuthenticated, (req, res) => {
  res.render('index', { tasks });
});

app.post('/add', ensureAuthenticated, (req, res) => {
  tasks.push({ id: tasks.length + 1, description: req.body.task, completed: false });
  res.redirect('/');
});

app.post('/edit/:id', ensureAuthenticated, (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) {
    task.description = req.body.description;
    task.completed = req.body.completed === 'on';
  }
  res.redirect('/');
});

app.post('/delete/:id', ensureAuthenticated, (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.redirect('/');
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
