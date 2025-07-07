const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'changeme';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// HTTP request logging
app.use(morgan('combined'))

const dataFile = process.env.DATA_FILE || path.join(__dirname, 'data.json')
let data = { users: [], ratings: [] };
if (fs.existsSync(dataFile)) {
  data = JSON.parse(fs.readFileSync(dataFile));
}

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Register request', email)
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  if (data.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, password: hashed };
  data.users.push(user);
  saveData();
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt', email)
  const user = data.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: '7d',
  });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/ratings', (req, res) => {
  console.log('List ratings');
  res.json(data.ratings);
});

app.post('/api/ratings', authMiddleware, (req, res) => {
  console.log('Create rating by user', req.user.email);
  const rating = { id: Date.now().toString(), userId: req.user.id, ...req.body };
  data.ratings.push(rating);
  saveData();
  res.json(rating);
});

app.get('/api/ratings/:id', (req, res) => {
  console.log('Get rating', req.params.id);
  const rating = data.ratings.find(r => r.id === req.params.id);
  if (!rating) return res.status(404).json({ message: 'Not found' });
  res.json(rating);
});

// Generic error handler so stack traces appear in logs
app.use((err, req, res, next) => {
  console.error('Unhandled error', err)
  res.status(500).json({ message: 'Server error' })
})

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`API running on port ${PORT} using ${dataFile}`),
  )
}

module.exports = app
