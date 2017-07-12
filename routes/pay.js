const express = require('express');
const routes = express();
const Transaction = require('../models/transaction');
const Event     = require('../models/event');
const Ticket = require('../models/ticket');
const passport = require('passport');
const hash = require('hash.js');

// const PesaPal = require('pesapaljs').init({
//     key: 'vtNBei7bL7WsiKFLA6m8bWqfHxMKWhAV',
//     secret: 'zfllndIRNiYEmHofkbJFToXGLLk=',
//     debug: true // false in production!
// });

const PesaPal = require('pesapaljs').init({
    key: 'wZtqdsOeG7gYADvZsI0vnKIHzNmZUswn',
    secret: 'VgkPR4OlePEW4QqaR3n/h0SqHeo=',
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
    const payment = req.payment;
    console.log(payment);
});

routes.get('/redirect', (req, res) => {
    var options = {
        transaction: req.query[PesaPal.getQueryKey('transaction')],
        reference: req.query[PesaPal.getQueryKey('reference')]
    };
    const data = {
        transactionPaymentMethod: 'MPESA',
        status: 'completed'
    }
    Transaction.findOneAndUpdate({transactionReference: options.reference}, data, {new: true}).then((transaction) => {
        if(transaction) {
            console.log(transaction);
            res.send("payment complete, ticket(s) available...have fun!");
            generateTicket(transaction, transaction.totalTickets);
        } else {
            res.send("opps, something went wrong.")
        }
    });
});

routes.post('/', passport.authenticate('jwt',{session: false}), (req, res) => {
    console.log('hit');
    Event.findById(req.body.eventId).then((event) => {
        if (event) {
            const transactionReference = hash.sha256().update(Date.now()+req.user._id+req.body.eventId).digest('hex').substring(0, 18).toUpperCase();
            const order = {
                userId: req.user._id,
                userEmail: req.user.email,
                eventId: req.body.eventId,
                transactionReference,
                transactionAmount: req.body.total,
                orderString: req.body.tickets + " for " + event.name,
                totalTickets: req.body.tickets,
                //temporary
                transactionPaymentMethod: 'MPESA',
                status: 'completed'
            }
            const transaction = new Transaction(order);
            transaction.save().then((transaction) => {
                if(transaction) {
                    const customer = new PesaPal.Customer(order.userEmail);
                    const pesapalOrder = new PesaPal.Order(order.transactionReference, customer, order.orderString, order.transactionAmount, "KES", "MERCHANT");
                    const url = PesaPal.getPaymentURL(pesapalOrder, "http://localhost:3000/api/pay/redirect");
                    res.status(200).json({
                        success: true,
                        iframe: '<iframe src="'+url+'" width="100%" height="1000px" scrolling="yes" frameBorder="0"><p>Browser unable to load iFrame</p></iframe>'
                    });
                    //temporary
                    generateTicket(transaction, transaction.totalTickets);
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }).catch((error) => {
        res.send('error');
    });
});

routes.post('/', passport.authenticate('jwt',{session: false}), (req, res) => {
    const transactionReference = hash.sha256().update(Date.now()+req.user+req.body.eventId).digest('hex').substring(0, 18).toUpperCase();
    const userId = req.user._id;

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
        } else {
            console.log('ticket(s) generated..have fun!')
        }
    }).catch((error) => {
        console.log('something went wrong generating tickets');
    });
}

module.exports = routes;
