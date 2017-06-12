const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

//so mongoose can stop throwing that warning
mongoose.Promise = global.Promise;

const managerSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
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
    events: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});
const Manager = mongoose.model('Manager', managerSchema);
module.exports = Manager;
