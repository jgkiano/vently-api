const express = require('express');

const routes = express();

//controller imports
const userController = require('../controllers/userController');

//user routes
routes.post('/user/register', userController.register);
routes.get('/users', userController.getAll);
routes.post('/users/killswitch', userController.deleteAll);


module.exports = routes;
