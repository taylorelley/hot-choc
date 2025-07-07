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
})
