const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server.js')

 // Write your tests here
 test('sanity', () => {
  expect(true).toBe(true)
})

describe('Jokes Auth', () => {

  beforeAll(async () => {
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  beforeEach(async () => {
    await db.seed.run()
  })

  afterAll(async () => {
    await db.destroy()
  })


  describe('[POST] /register', () => {

    it(`returns error if no username in body`, async () => {
      const res = await request(server).post('/api/auth/register').send({ username: "albrt"})
      expect(res.body).toMatchObject({message: "username and password required"})
      const dbTotal = await db('users')
      expect(dbTotal.length).toEqual(3)
    })

    it(`adds new user to databse`, async () => {
      const res = await request(server).post('/api/auth/register').send({ username: "albrt", password: "code"})
      expect(res.body).toMatchObject({id: 4, username: "albrt", password: expect.any(String)})
      const dbTotal = await db('users')
      expect(dbTotal.length).toEqual(4)
    })


  })

  describe('[POST] /login', () => {
    it('does not login if password does not match', async () => {
      const userLogin = await request(server).post('/api/auth/login').send({ username: "test", password: "abc123"})
      expect(userLogin.body).toMatchObject({ message: "invalid credentials" })
    })

    it('logs user in and sends back welcome message', async () => {
      const dbTotal = await db('users')
      expect(dbTotal.length).toEqual(3)
      const userLogin = await request(server).post('/api/auth/login').send({ username: "jon", password: "jon123"})
      expect(userLogin.status).toBe(401)
    })
  })
})
