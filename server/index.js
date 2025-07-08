const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const path = require('path')
const Database = require('better-sqlite3')

const PORT = process.env.PORT || 3001
const SECRET = process.env.JWT_SECRET || 'changeme'
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'db.sqlite')

const db = new Database(DB_FILE)

db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`,
).run()

db.prepare(
  `CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    userId TEXT,
    data TEXT
  )`,
).run()

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(morgan('combined'))

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Missing token' })
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Missing fields' })
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(400).json({ message: 'Email exists' })
  const hashed = await bcrypt.hash(password, 10)
  const id = Date.now().toString()
  db.prepare('INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)').run(
    id,
    name,
    email,
    hashed,
  )
  res.json({ id, name, email })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(400).json({ message: 'Invalid credentials' })
  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: '7d',
  })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

app.get('/api/ratings', (req, res) => {
  const rows = db.prepare('SELECT data FROM ratings').all()
  res.json(rows.map((r) => JSON.parse(r.data)))
})

app.get('/api/user/ratings', authMiddleware, (req, res) => {
  const rows = db
    .prepare('SELECT data FROM ratings WHERE userId = ?')
    .all(req.user.id)
  res.json(rows.map((r) => JSON.parse(r.data)))
})

app.post('/api/ratings', authMiddleware, (req, res) => {
  const rating = { id: Date.now().toString(), userId: req.user.id, ...req.body }
  db.prepare('INSERT INTO ratings (id,userId,data) VALUES (?,?,?)').run(
    rating.id,
    rating.userId,
    JSON.stringify(rating),
  )
  res.json(rating)
})

app.get('/api/ratings/:id', (req, res) => {
  const row = db
    .prepare('SELECT data FROM ratings WHERE id = ?')
    .get(req.params.id)
  if (!row) return res.status(404).json({ message: 'Not found' })
  res.json(JSON.parse(row.data))
})

app.delete('/api/ratings/:id', authMiddleware, (req, res) => {
  const row = db
    .prepare('SELECT data FROM ratings WHERE id = ?')
    .get(req.params.id)
  if (!row) return res.status(404).json({ message: 'Not found' })
  const rating = JSON.parse(row.data)
  if (rating.userId && rating.userId !== req.user.id)
    return res.status(403).json({ message: 'Forbidden' })
  db.prepare('DELETE FROM ratings WHERE id = ?').run(req.params.id)
  res.json({ message: 'Deleted' })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error', err)
  res.status(500).json({ message: 'Server error' })
})

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`API running on port ${PORT} using ${DB_FILE}`),
  )
}

module.exports = app
