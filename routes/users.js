const express = require('express');
const routes = express();

//middleware imports
const Middleware = require('../middleware/users');

//controller imports
const userController = require('../controllers/userController');

//get all users
routes.get('/', userController.getAll);

//register a single user
routes.post('/', Middleware.validateRegistration, userController.addSingle);

//get single user info
routes.get('/:id', userController.getSingle);

//update only firstname and lastname
routes.put('/:id', Middleware.validateBasicInfo, userController.updateSingle);

// update only email
routes.put('/:id/email',  Middleware.validateEmail, userController.updateSingleEmail);

// update only phone
routes.put('/:id/phone',  Middleware.validatePhone, userController.updateSinglePhone);

// update only password
routes.put('/:id/pass', Middleware.validatePassword,  userController.updateSinglePassword);

// soft delete single user
routes.delete('/:id', userController.deleteSingle);

// temporary killswitch route for all users - with great power comes great responsibility
routes.delete('/', userController.deleteAll);

module.exports = routes;
