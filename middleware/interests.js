const Interest      = require('../models/interest');
const ErrorMsgs     = require('../error-msgs/interests')
const Middleware    = {};

Middleware.validateInterest = (req, res, next) => {
    if(!req.body.name) {
        res.status(500).json({
            message: ErrorMsgs.nameReq
        });
        return;
    }
    if(!req.body.icon) {
        res.status(500).json({
            message: 'Icon is required'
        });
        return;
    }
    req.body.name = toTitleCase(req.body.name.toString())
    next();
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = Middleware;
