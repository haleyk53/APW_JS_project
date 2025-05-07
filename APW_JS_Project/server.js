const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');



const app = express();
const SALT_ROUNDS = 10;
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost:27017/GameCenter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true in production with HTTPS
}));

// Schema and Model
const snakeScoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
  createdAt: { type: Date, default: Date.now }
});
const SnakeScore = mongoose.model('SnakeScore', snakeScoreSchema);

const numberGuessScoreSchema = new mongoose.Schema({
  username: String,
  attempts: Number,
  createdAt: { type: Date, default: Date.now }
});
const NumberGuessScore = mongoose.model('NumberGuessScore', numberGuessScoreSchema);

const wordGuessScoreSchema = new mongoose.Schema({
  username: String,      // User's username 
  word: String,          // The word guessed in the game
  guesses: Number,       // Number of attempts to guess the word
  success: Boolean,      // Whether the user succeeded in guessing the word
  createdAt: { type: Date, default: Date.now } // Timestamp when the game was played
});

const WordGuessScore = mongoose.model('WordGuessScore', wordGuessScoreSchema);


const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  email: String,
  age: Number
});
const User = mongoose.model('User', userSchema);


// Routes
app.post('/api/snake/score', (req, res) => {
  const { score } = req.body;
  const username = req.session?.username || 'Guest';

  if (typeof score === 'number') {
    const newScore = new SnakeScore({ username, score });
    newScore.save()
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(400);
  }
});

app.get('/api/snake/leaderboard', async (req, res) => {
  try {
    const topScores = await SnakeScore.find()
      .sort({ score: -1 })
      .limit(10);

    const leaderboard = topScores.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      score: entry.score
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/api/numberguess/score', (req, res) => {
  const { attempts } = req.body;
  const username = req.session?.username || 'Guest';

  if (typeof attempts === 'number') {
    const newScore = new NumberGuessScore({ username, attempts });
    newScore.save()
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(400);
  }
});

app.get('/api/numberguess/leaderboard', async (req, res) => {
  try {
    const topScores = await NumberGuessScore.find()
      .sort({ attempts: 1 }) // Lower attempts are better
      .limit(10);

    const leaderboard = topScores.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      attempts: entry.attempts
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Post a score for Word Guesser game
app.post('/api/wordguess/score', (req, res) => {
  const { word, guesses, success } = req.body;
  const username = req.session?.username || 'Guest';

  if (typeof word === 'string' && typeof guesses === 'number' && typeof success === 'boolean') {
    const newScore = new WordGuessScore({ username, word, guesses, success });
    newScore.save()
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(400); // Bad request if the data is incorrect
  }
});

// Get leaderboard for Word Guesser game
app.get('/api/wordguess/leaderboard', async (req, res) => {
  try {
    const topScores = await WordGuessScore.find()
      .sort({ guesses: 1 })  // Lower guesses are better
      .limit(10);

    const leaderboard = topScores.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      guesses: entry.guesses,
      success: entry.success ? 'Yes' : 'No'
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);  // Internal server error if fetching fails
  }
});

app.get('/leaderboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Javascript Front-End', 'leaderboard.html'));
});


app.get('/api/leaderboard/all', async (req, res) => {
  const query = req.query.q || '';
  const regex = new RegExp(query, 'i'); // case-insensitive regex for search

  try {
    const [snakeScores, numberGuessScores, wordGuessScores] = await Promise.all([
      SnakeScore.find({ username: regex }),
      NumberGuessScore.find({ username: regex }),
      WordGuessScore.find({ username: regex }),
    ]);

    res.json({
      snake: snakeScores.map((s) => ({
        username: s.username,
        score: s.score,
        date: s.createdAt,
        game: 'Snake',
      })),
      numberGuess: numberGuessScores.map((n) => ({
        username: n.username,
        attempts: n.attempts,
        date: n.createdAt,
        game: 'Number Guesser',
      })),
      wordGuess: wordGuessScores.map((w) => ({
        username: w.username,
        guesses: w.guesses,
        success: w.success,
        word: w.word,
        date: w.createdAt,
        game: 'Word Guesser',
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch leaderboard data');
  }
});


// Register route
app.post('/register', express.urlencoded({ extended: true }), async (req, res) => {
  const { username, password, name, email, age } = req.body;
  if (!username || !password || !name || !email || !age) return res.status(400).send("All fields required");

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).send("Username already exists");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, password: hashedPassword, name, email, age });
    await user.save();

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error registering user");
  }
});


// Login route
app.post('/login', express.urlencoded({ extended: true }), async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send('Invalid credentials');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return res.status(401).send('Invalid credentials');

  req.session.username = username;
  res.sendStatus(200);
});



// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
});

// Session check
app.get('/session', (req, res) => {
  res.json({ username: req.session.username || null });
});


// Static files and pages
app.use(express.static(path.join(__dirname, 'Javascript Front-End')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Javascript Front-End', 'index.html'));
});

app.get('/snake.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Javascript Front-End', 'snake.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Javascript Front-End', 'register.html'));
});

app.get('/numberguess.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Javascript Front-End', 'numberGuess.html'));
});

app.get('/users', async (req, res) => {
  try {
    const users = await mongoose.connection.db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
