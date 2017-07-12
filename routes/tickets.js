const express = require('express');
const routes = express();
const passport = require('passport');
const Ticket = require('../models/ticket');
const User = require('../models/user');


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

routes.post('/', passport.authenticate('jwt',{session: false}), (req, res) => {
    let {
        phone,
        eventId
    } = req.body;

    if (phone.charAt(0) === "0") {
        phone = phone.substring(1);
    }

    if (phone.charAt(0) === "+") {
        phone = phone.substring(4);
    }

    if (phone.charAt(0) === "2") {
        phone = phone.substring(3);
    }

    phone = Number(phone);


    User.findOne({ phone })
    .then((user) => {
        if(user) {
            Ticket.findOneAndUpdate({ eventId, currentOwner: req.user._id }, {currentOwner: user._id}, { new: true })
            .then((ticket) => {
                if(ticket) {
                    console.log('ticket shared')
                    res.status(200).json({
                        success: true,
                        message: 'Ticket shared successfully'
                    });
                    return;
                }
                res.status(500).json({
                    error: 421,
                    message: 'Ticket not found. Share failed'
                });
                return;
            })
            .catch((error) => {
                res.status(500).json({
                    error: 422,
                    message: 'Share failed, something went wrong'
                });
            });
        } else {
            res.status(500).json({
                error: 420,
                message: 'User not found'
            });
            return;
        }
    })
    .catch((error) => {
        res.status(500).json({
            error: 423,
            message: 'User not found. something went wrong'
        });
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
