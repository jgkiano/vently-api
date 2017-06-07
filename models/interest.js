const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

//so mongoose can stop throwing that warning
mongoose.Promise = global.Promise;

const interestSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});
const Interest = mongoose.model('Interest', interestSchema);
module.exports = Interest;
