const express   = require('express');
const passport  = require('passport');
const routes    = express();
const Event     = require('../models/event');
// middleware imports
const Middleware = require('../middleware/managers');

// controller imports
const managerController = require('../controllers/managerController');

// get all managers - temporary
routes.get('/all', managerController.getAll);

routes.get('/', managerController.getAll);

// get single manager info
// routes.get('/:id', managerController.getSingle);

// register a single manager
routes.post('/', managerController.addSingle);

// authenticate a single manager
// routes.post('/authenticate', Middleware.validateAuthentication, managerController.authenticateSingle);

// update only firstname and lastname
// routes.put('/:id', Middleware.validateBasicInfo, managerController.updateSingle);

// update only email
// routes.put('/:id/email', Middleware.validateEmail, managerController.updateSingleEmail);

// update only phone
// routes.put('/:id/phone', Middleware.validatePhone, managerController.updateSinglePhone);

// update only password
// routes.put('/:id/pass', Middleware.validatePassword,  managerController.updateSinglePassword);

// soft delete single manager
// routes.delete('/:id', managerController.deleteSingle);

//temporary killswitch route for all managers - with great power comes great responsibility
routes.delete('/', managerController.deleteAll);

module.exports = routes;
