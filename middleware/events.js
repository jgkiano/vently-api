const moment = require('moment');
const Event      = require('../models/event');
const ErrorMsgs     = require('../error-msgs/events');
const Interest      = require('../models/interest');
const Manager      = require('../models/manager');

const Middleware    = {};

const dateFormat = "YYYY-M-D H:m";
const region = 'Kenya/Nairobi';

const MINIMUM_DATE_DIFF = 5;

Middleware.validateEvent = (req, res, next) => {
    const { name, dateFrom, dateTo, location, locationDescription, description, banner, interest, manager } = req.body;
    const errors = [];

    if(!name) {
        errors.push({
            name: ErrorMsgs.nameReq
        });
    }

    const eventDate = moment(dateFrom);
    const currentDate = moment(Date.now());
    const diff = eventDate.diff(currentDate,'days');

    if(diff <= MINIMUM_DATE_DIFF) {
        errors.push({
            date: ErrorMsgs.dateReq
        });
    } else {
        req.body.dateFrom = moment(dateFrom).utc().format();
        req.body.dateTo = moment(dateTo).utc().format();
    }

    if (!validateCoordinates(location)) {
        errors.push({
            location: ErrorMsgs.locReq
        });
    }

    if(!locationDescription) {
        errors.push({
            locationDescription: ErrorMsgs.locDescReq
        });
    }

    if(!description) {
        errors.push({
            description: ErrorMsgs.descReq
        });
    }

    if(!banner) {
        errors.push({
            banner: ErrorMsgs.bannerReq
        });
    }

    if(!isValidObjectId(interest)) {
        errors.push({
            interest: ErrorMsgs.interestReq
        });
    }

    if(!isValidObjectId(manager)) {
        errors.push({
            manager: ErrorMsgs.managerReq
        });
    }

    if(errors.length > 0) {
        res.status(500).json({
            message: errors
        });
        return;
    }

    Interest.findById(interest).then((interest) => {
        if (!interest) {
            errors.push({
                interest: ErrorMsgs.interestReq
            });
            res.status(500).json({
                message: errors
            });
            return;
        }
        return Manager.findById(manager);
    }).then((manager) => {
        if(manager) {
            next();
        } else {
            errors.push({
                interest: ErrorMsgs.managerReq
            });
            res.status(500).json({
                message: errors
            });
            return;
        }
    }).catch((error) => {
        res.status(500).json({
            message: error
        });
    });

};

function validateCoordinates(location) {
    if(location) {
        if(location.constructor == Array && location.length == 2) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isValidObjectId(id) {
    const hexPattern = /^[0-9a-fA-F]{24}$/;
    if (!hexPattern.test(id)) {
        return false;
    }
    return true;
}

module.exports = Middleware;
