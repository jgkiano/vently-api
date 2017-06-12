const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

//so mongoose can stop throwing that warning
mongoose.Promise = global.Promise;

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: [{
        type: Number,
        required: true
    }],
    locationDescription: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    banner: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    interest: {
        type : mongoose.Schema.Types.ObjectId, ref: 'Interest',
        required: true
    },
    manager: {
        type : mongoose.Schema.Types.ObjectId, ref: 'Manager',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
