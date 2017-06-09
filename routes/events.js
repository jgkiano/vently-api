const express   = require('express');
const passport  = require('passport');
const routes    = express();
const Event     = require('../models/event');

// const Middleware = require('../middleware/events');


// controller imports
const eventController = require('../controllers/eventController');

// get all users - temporary
routes.get('/', eventController.getAll);

//get single interest
routes.get('/:id', eventController.getSingle);

//update single interest
// routes.put('/:id', Middleware.validateInterest, eventController.updateSingle);

//add single interest
// routes.post('/', Middleware.validateInterest, eventController.addSingle);

//soft delete single interest
// routes.delete('/:id', eventController.deleteSingle);

//temporary kill switch
// routes.delete('/', eventController.deleteAll);

module.exports = routes;



// routes.get('/', (req, res) => {
//     res.send('working')
// });
//
routes.post('/', (req, res) => {
    const name          = req.body.name;
    const date          = req.body.date;
    const location      = req.body.location;
    const description   = req.body.description;
    const banner        = req.body.banner;
    const price         = req.body.price;
    const interest      = req.body.interest;

    const event = new Event({ name, date, location, description, banner, price, interest });
    event.save().then((event) => {
        res.status(200).json({
            success: true,
            event
        });
    }).catch((error) => {
        res.status(500).json({
            error: error.toString()
        });
    });
});


module.exports = routes;
