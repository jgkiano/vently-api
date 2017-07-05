const express = require('express');
const routes = express();
const Transaction = require('../models/transaction');
const Ticket = require('../models/ticket');
const passport = require('passport');
const hash = require('hash.js');

const PesaPal = require('pesapaljs').init({
    key: 'INuFexOgQGHIbW92KZd9w/aOOwgX8lRv',
    secret: '9wwEsKg/2tJPDpKOLFcNC5lLmeY=',
    debug: false // false in production!
});

routes.get('/', (req, res) => {
    Transaction.find({}).then((transactions) => {
        res.status(200).json({
            success: true,
            transactions
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: 'error'
        });
    });
});

routes.get('/ipn', PesaPal.paymentListener, (req, res) => {
    var payment = req.payment;
    // do stuff with payment {transaction, method, status, reference}
    // DO NOT res.send()
});

routes.get('/dummy', (req, res) => {
    var customer = new PesaPal.Customer("jgkiano@gmail.com");
    var order = new PesaPal.Order("42314123", customer, "Ma ndazi", 500, "KES", "MERCHANT");
    // Redirect user to PesaPal
    var url = PesaPal.getPaymentURL(order, "http://mysite.co.ke/callback");
    // Send it to an iframe?
    res.send('<iframe src="'+url+'" width="100%" height="1000px" scrolling="yes" frameBorder="0"><p>Browser unable to load iFrame</p></iframe>');
});

routes.post('/', passport.authenticate('jwt',{session: false}), (req, res) => {
    const transactionReference = hash.sha256().update(Date.now()+req.user+req.body.eventId).digest('hex').substring(0, 18).toUpperCase();
    const userId = req.user._id;
    const order = {
        transactionReference,
        transactionAmount: req.body.transactionAmount,
        transactionPaymentMethod: req.body.transactionPaymentMethod,
        status: req.body.status,
        totalTickets: req.body.totalTickets,
        eventId: req.body.eventId,
        userId,
    }
    const transaction = new Transaction(order);
    transaction.save().then((transaction) => {
        generateTicket(transaction, transaction.totalTickets);
        res.status(200).json({
            success: true,
            data: transaction
        });
    }).catch((error) => {
        console.log(error);
    });
});

routes.delete('/', (req, res) => {
    Ticket.remove({}).then((tickets) => {
        console.log('removed tickets')
    });
    Transaction.remove({}).then((data) => {
        res.status(200).json({
            success: true,
            message: 'removed all',
            data
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: "error on killswitch"
        });
    });
});


generateTicket = (transaction, totalTickets) => {
    const ticketInfo = {
        eventId: transaction.eventId,
        originalOwner: transaction.userId,
        currentOwner: transaction.userId,
        transactionId: transaction._id
    };
    const ticket = new Ticket(ticketInfo);
    ticket.save().then((ticket) => {
        totalTickets = totalTickets - 1;
        if (totalTickets > 0) {
            generateTicket(transaction, totalTickets);
        }
    }).catch((error) => {
        console.log('something went wrong generating tickets');
    });
}

module.exports = routes;
