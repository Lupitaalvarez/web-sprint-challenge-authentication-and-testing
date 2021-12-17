const router = require('express').Router();
const model = require('./auth-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../secret');

const processErr = (res, where) => err => res.status(500).json({where, message:err.message, stack:err.stack, error:err});

 router.post('/register', async (req, res) => {
   const { username, password } = req.body;
   if(!username||!password) res.status(400).json({message:"username and password required"});
   else if(typeof username !== "string" && typeof password !== "string") res.status(400).json({message:"username and password must be of type string"});
   else await model.getBy({ username }).then(users => {
     if(users.length) res.status(400).json({message:"username taken"})
     else {
       const hash = bcrypt.hashSync(password, 8);
       req.payload = { username, password: hash };
       model.insert(req.payload)
         .then(user => res.status(201).json(user))
         .catch(processErr(res, "adding user"));
     }
   })
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if(!username||!password) res.status(400).json({message:"username and password required"});
  else if(typeof username !== "string" && typeof password !== "string") res.status(400).json({message:"username and password must be of type string"});
  else {
    model.getBy({ username }).first()
      .then(user => {
        if(user && bcrypt.compareSync(password, user.password)) {
          const token = jwt.sign({subject:user.id, username}, secret, {expiresIn: "1d"});
          res.status(200).json({message:`welcome, ${username}`, token});
        }
        else res.status(400).json({message:"invalid credentials"});
      })
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
