const express = require('express');
const passport = require('passport');
const routes = express();

// controller imports
const interestController = require('../controllers/interestController');

// get all users - temporary
routes.get('/', interestController.getAll);

routes.post('/', interestController.addSingle);

module.exports = routes;
