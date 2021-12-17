const db = require("../../data/dbConfig");

const getAll = () => db("users");

const getBy = filter => db("users").where(filter);

const getById = id => db("users").where({ id }).first();

const insert = ({username, password}) => db("users").insert({username, password}).then(([id]) => {return{id, username, password}});

module.exports = {
getAll,
getBy,
getById,
insert
};