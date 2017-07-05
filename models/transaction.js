const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

//so mongoose can stop throwing that warning
mongoose.Promise = global.Promise;

const transactionSchema = new Schema({
    transactionReference: {
        type: String,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    transactionAmount: {
        type: Number,
        required: true
    },
    transactionPaymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
        required: true
    },
    totalTickets: {
        type: Number,
        required: true
    }
});
const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
