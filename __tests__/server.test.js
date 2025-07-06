/* @jest-environment node */
const request = require('supertest')
const path = require('path')

process.env.DATA_FILE = path.join(__dirname, 'test_data.json')
const app = require('../server/index')
const fs = require('fs')

afterAll(() => {
  if (fs.existsSync(process.env.DATA_FILE)) {
    fs.unlinkSync(process.env.DATA_FILE)
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
    const res = await request(app).post('/api/login').send({ email: user.email, password: user.password })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })
})
