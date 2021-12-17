const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");
const jokes = require("./jokes/jokes-data");

const exampleUsers = [
  {"username": "Captain Marvel", "password": "foobar"},
  {"username": "User Two", "password": "Try2GuessThis"}
];
const exampleReturns = [
  {"id": 1, "username": "Captain Marvel"},
  {"id": 2, "username": "User Two"}
];

// Write your tests here
test('[0] sanity and resetting the db', async () => {
  await db("users").truncate();
  expect(true).toBe(true);
})
describe("server", () => {
  describe("register", () => {
    it("[1] adding a user gives the right response and adds the user", async () => {
      await request(server).post("/api/auth/register").send(exampleUsers[0])
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual(exampleReturns[0]);
        });
      await db("users")
        .then(resp => {
          expect(resp).toEqual([exampleReturns[0]]);
        });
    })
  })
  describe("login", () => {
    it("hello", () => {

    })
  })
  describe("getting jokes", () => {
    it("hello", () => {

    })
  })
})
