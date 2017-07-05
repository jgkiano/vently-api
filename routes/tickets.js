const express = require('express');
const routes = express();
const Ticket = require('../models/ticket');

routes.get('/', (req, res) => {
    Ticket.find({}).then((tickets) => {
        res.status(200).json({
            success: true,
            data: tickets
        });
    }).catch((error) => {
        res.send('error');
    });
});

routes.get('/:id', (req, res) => {
    Ticket.findById(req.params.id)
    .populate('eventId')
    .then((ticket) => {
        res.status(200).json({
            success: true,
            ticket
        });
    }).catch((error) => {
        res.send('error');
    });
});

module.exports = routes;
