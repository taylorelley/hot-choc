/* @jest-environment node */
const request = require('supertest')
const path = require('path')

process.env.DB_FILE = path.join(__dirname, 'test.db')
const app = require('../server/index')
const fs = require('fs')

afterAll(() => {
  if (fs.existsSync(process.env.DB_FILE)) {
    fs.unlinkSync(process.env.DB_FILE)
  }
})

describe('server api', () => {
  test('GET /api/ratings returns array', async () => {
    const res = await request(app).get('/api/ratings')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('register and login', async () => {
    const user = { name: 'Test', email: 'test@example.com', password: 'pass' }
    await request(app).post('/api/register').send(user).expect(200)
    const Database = require('better-sqlite3')
    const db = new Database(process.env.DB_FILE)
    const stored = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(user.email)
    db.close()
    expect(stored).toBeDefined()
    const res = await request(app)
      .post('/api/login')
      .send({ email: user.email, password: user.password })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toEqual({
      id: expect.any(String),
      name: 'Test',
      email: user.email,
    })
  })

  test('create and delete rating', async () => {
    const user = { name: 'Del', email: 'del@example.com', password: 'pass' }
    await request(app).post('/api/register').send(user)
    const login = await request(app)
      .post('/api/login')
      .send({ email: user.email, password: user.password })
    const token = login.body.token
    const create = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ location: { name: 'Cafe' }, ratings: {}, notes: '' })
    const ratingId = create.body.id
    const del = await request(app)
      .delete(`/api/ratings/${ratingId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(200)
    const list = await request(app).get('/api/ratings')
    expect(list.body.find((r) => r.id === ratingId)).toBeUndefined()
  })

  test('user ratings endpoint', async () => {
    const user1 = { name: 'A', email: 'a@example.com', password: 'pass' }
    await request(app).post('/api/register').send(user1)
    const login1 = await request(app)
      .post('/api/login')
      .send({ email: user1.email, password: user1.password })
    const token1 = login1.body.token
    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token1}`)
      .send({ location: { name: 'Cafe1' }, ratings: {}, notes: '' })

    const user2 = { name: 'B', email: 'b@example.com', password: 'pass' }
    await request(app).post('/api/register').send(user2)
    const login2 = await request(app)
      .post('/api/login')
      .send({ email: user2.email, password: user2.password })
    const token2 = login2.body.token

    const list1 = await request(app)
      .get('/api/user/ratings')
      .set('Authorization', `Bearer ${token1}`)
    expect(list1.body.length).toBe(1)
    expect(list1.body[0].userId).toBe(login1.body.user.id)

    const list2 = await request(app)
      .get('/api/user/ratings')
      .set('Authorization', `Bearer ${token2}`)
    expect(Array.isArray(list2.body)).toBe(true)
    expect(list2.body.length).toBe(0)
  })

  test('handles large rating payloads', async () => {
    const user = { name: 'Big', email: 'big@example.com', password: 'pass' }
    await request(app).post('/api/register').send(user)
    const login = await request(app)
      .post('/api/login')
      .send({ email: user.email, password: user.password })
    const token = login.body.token
    const bigPhoto = 'x'.repeat(200000) // ~200kb string
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photo: bigPhoto,
        location: { name: 'Cafe' },
        ratings: {},
        notes: '',
      })
    expect(res.status).toBe(200)
    expect(res.body.photo.length).toBe(bigPhoto.length)
  })
})
