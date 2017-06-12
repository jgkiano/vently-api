const express = require('express');
const passport = require('passport');
const routes = express();
const Middleware = require('../middleware/interests');

// controller imports
const interestController = require('../controllers/interestController');

// get all interests - temporary
routes.get('/', interestController.getAll);

//get single interest
routes.get('/:id', interestController.getSingle);

//update single interest
routes.put('/:id', Middleware.validateInterest, interestController.updateSingle);

//add single interest
routes.post('/', Middleware.validateInterest, interestController.addSingle);

//soft delete single interest
routes.delete('/:id', interestController.deleteSingle);

//temporary kill switch
routes.delete('/', interestController.deleteAll);

module.exports = routes;
