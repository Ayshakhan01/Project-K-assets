// App.js

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./model/User");

const app = express();

// MongoDB connection setup
mongoose.connect("mongodb://localhost:27017/project_k", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.set("view engine", "ejs");

// Body parsers should be configured before routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration should be before passport initialization
app.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ROUTES

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
  res.render("secret");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
    });

    await User.register(newUser, req.body.password);

    console.log("User registered successfully:", newUser);
    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.render("secret");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
