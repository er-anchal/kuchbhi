const express = require('express');
const mongoose = require('mongoose');
const Card = require('./models/card');
const User = require('./models/user');
const app = express();
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Configure CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoURL = 'mongodb://localhost:27017/anchal';

const store = MongoStore.create({
    mongoUrl: MongoURL,
    crypto: {
        secret: "fffhfhfgdffghrtfgsglsfdk",
    },
    touchAfter: 24 * 3600
});

const sessionOptions = {
    store,
    secret: "fffhfhfgdffghrtfgsglsfdk",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    },
}

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(MongoURL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/cards', async (req, res) => {
    const cards = await Card.find();
    res.json(cards);
});

app.post('/cards', async (req, res) => {
    console.log(req.body);
    const { name, desc } = req.body;
    const newCard = new Card({ name, desc });
    await newCard.save();
    res.json(newCard);
});

app.post('/signup', async (req, res) => {
    try {
        let { email, name, password, phone } = req.body;
        console.log("Signup attempt:", { email, name, phone });
        
        if (!email || !name || !password) {
            return res.status(400).json({ message: 'Email, name, and password are required' });
        }
        
        let newUser = new User({ username: name, email, phone });
        let registeredUser = await User.register(newUser, password).catch(err => {
            console.error("Error registering user:", err);
            throw err;
        });
        console.log("User registered:", registeredUser);
        
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login error:", err);
                return res.status(500).json({ message: 'Login after signup failed', error: err.message });
            }
            res.status(200).json({ message: 'Signup successful', user: registeredUser });
        });
    } catch (e) {
        console.error("Signup error:", e);
        res.status(400).json({ message: 'Signup failed', error: e.message });
    }
});

app.post('/login', passport.authenticate("local"), (req, res) => {
    res.status(200).json({ message: 'Login successful', user: req.user });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed', error: err.message });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

app.listen(5000, () => console.log(`Server running on port 5000`));  

