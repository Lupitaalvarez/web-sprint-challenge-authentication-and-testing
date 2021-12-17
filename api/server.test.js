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
   await db.migrate.rollback();
   await db.migrate.latest();
   expect(true).toBe(true);
 })
 describe("server", () => {
  describe("register", () => {
    it("[1] adding a user gives the right response and adds the user", async () => {
      await request(server).post("/api/auth/register").send(exampleUsers[0])
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body.id).toBe(exampleReturns[0].id);
          expect(response.body.username).toBe(exampleReturns[0].username);
          expect(typeof response.body.password).toBe("string");
          expect(response.body.password).toBeTruthy();
        });
      await db("users")
        .then(resp => {
          expect(resp).toHaveLength(1);
          expect(resp[0].id).toBe(exampleReturns[0].id);
          expect(resp[0].username).toBe(exampleReturns[0].username);
          expect(typeof resp[0].password).toBe("string");
          expect(resp[0].password).toBeTruthy();
        });
    })
    it("[2] registering without fields filled in gives appropriate error", async () => {
      await request(server).post("/api/auth/register")
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username and password required");
        });
      await request(server).post("/api/auth/register").send({username:exampleUsers[0].username})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username and password required");
        });
      await request(server).post("/api/auth/register").send({password:exampleUsers[0].password})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username and password required");
        });
    })
    it("[3] registering a user that already exists gives an appropriate 400 error", async () => {
      await request(server).post("/api/auth/register").send(exampleUsers[0])
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username taken");
        });
    })
    it("[4] adding an additional user still works", async () => {
      await request(server).post("/api/auth/register").send(exampleUsers[1])
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body.id).toBe(exampleReturns[1].id);
          expect(response.body.username).toBe(exampleReturns[1].username);
          expect(typeof response.body.password).toBe("string");
          expect(response.body.password).toBeTruthy();
        });
      await db("users")
        .then(resp => {
          expect(resp).toHaveLength(2);
          expect(resp[1].id).toBe(exampleReturns[1].id);
          expect(resp[1].username).toBe(exampleReturns[1].username);
          expect(typeof resp[1].password).toBe("string");
          expect(resp[1].password).toBeTruthy();
        });
    })
  })
  describe("login", () => {
    it("[5] logging in with the credentials logs in properly", async () => {
      await request(server).post("/api/auth/login").send(exampleUsers[0])
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.message).toBe(`welcome, ${exampleUsers[0].username}`);
          expect(response.body.token).toBeTruthy();
        })
    })
    it("[6] logging in with wrong credentials responds properly", async () => {
      await request(server).post("/api/auth/login")
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username and password required");
        });
      await request(server).post("/api/auth/login").send({username:exampleUsers[0].username})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username and password required");
        });
      await request(server).post("/api/auth/login").send({password:exampleUsers[0].password})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("username and password required");
        });
      await request(server).post("/api/auth/login").send({username:exampleUsers[0].username, password:exampleUsers[1].password})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.message).toBe("invalid credentials");
        })
    })
  })
  describe("getting jokes", () => {
    it("[7] error getting jokes when not logged in", async () => {
      await request(server).get("/api/jokes")
        .then(response => {
          expect(response.status).toBe(401);
          expect(response.body.message).toBe("Token required");
        })
      await request(server).get("/api/jokes").set({ Authorization: "foobar"})
        .then(response => {
          expect(response.status).toBe(401);
          expect(response.body.message).toBe("Token invalid");
        })
    })
    it("[8] getting jokes works with valid token", async () => {
      let token;
      await request(server).post("/api/auth/login").send(exampleUsers[1])
        .then(response => token = response.body.token);
      await request(server).get("/api/jokes").set({ Authorization: token })
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(jokes);
        })
    })
  })
})
