const express       = require('express');
const routes        = express();

//user routes
const usersRoute    = require('./users');
routes.use('/users', usersRoute);


module.exports = routes;
