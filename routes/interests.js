const express = require('express');
const passport = require('passport');
const routes = express();
const Middleware = require('../middleware/interests')

// controller imports
const interestController = require('../controllers/interestController');

// get all users - temporary
routes.get('/', interestController.getAll);

routes.post('/', Middleware.validateNewInterest, interestController.addSingle);

module.exports = routes;
