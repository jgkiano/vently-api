const express = require('express');
const passport = require('passport');
const routes = express();

// middleware imports
const Middleware = require('../middleware/users');

// controller imports
const userController = require('../controllers/userController');

// get all users - temporary
routes.get('/all', userController.getAll);

// get single user info
routes.get('/', passport.authenticate('jwt',{session: false}), userController.getSingle);

// register a single user
routes.post('/', Middleware.validateRegistration, userController.addSingle);

// authenticate a single user
routes.post('/authenticate', Middleware.validateAuthentication, userController.authenticateSingle);

// update only firstname and lastname
routes.put('/', passport.authenticate('jwt',{session: false}), Middleware.validateBasicInfo, userController.updateSingle);

// update only email
routes.put('/email', passport.authenticate('jwt',{session: false}), Middleware.validateEmail, userController.updateSingleEmail);

// update only phone
routes.put('/phone', passport.authenticate('jwt',{session: false}), Middleware.validatePhone, userController.updateSinglePhone);

// update only password
routes.put('/pass', passport.authenticate('jwt',{session: false}), Middleware.validatePassword,  userController.updateSinglePassword);

// soft delete single user
routes.delete('/', passport.authenticate('jwt',{session: false}), userController.deleteSingle);

// temporary killswitch route for all users - with great power comes great responsibility
routes.delete('/all', userController.deleteAll);

module.exports = routes;
