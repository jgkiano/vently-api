const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

//so mongoose can stop throwing that warning
mongoose.Promise = global.Promise;

const ticketSchema = new Schema({
    eventId: {
        type : mongoose.Schema.Types.ObjectId, ref: 'Event',
        required: true
    },
    originalOwner: {
        type : mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    currentOwner: {
        type : mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    transactionId: {
        type : mongoose.Schema.Types.ObjectId, ref: 'Transaction',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});
const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
