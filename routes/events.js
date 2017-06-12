const express   = require('express');
const passport  = require('passport');
const routes    = express();
const Event     = require('../models/event');
const Middleware = require('../middleware/events');


// const Middleware = require('../middleware/events');


// controller imports
const eventController = require('../controllers/eventController');

// get all events - temporary
routes.get('/', eventController.getAll);

//get single event
routes.get('/:id', eventController.getSingle);

//add single event
routes.post('/', Middleware.validateEvent, eventController.addSingle);

//update single interest
routes.put('/:id', eventController.updateSingle);

//soft delete single interest
routes.delete('/:id', eventController.deleteSingle);

//temporary kill switch
routes.delete('/', eventController.deleteAll);

module.exports = routes;



// routes.get('/', (req, res) => {
//     res.send('working')
// });
//
routes.post('/', (req, res) => {

});


module.exports = routes;
