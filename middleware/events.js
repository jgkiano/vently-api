const moment = require('moment');
const Event      = require('../models/event');
const ErrorMsgs     = require('../error-msgs/interests');
const Interest      = require('../models/interest');

const Middleware    = {};

const dateFormat = "YYYY-M-D H:m";
const region = 'Kenya/Nairobi';

Middleware.validateEvent = (req, res, next) => {
    const { name, date, location, locationDescription, description, banner, interest } = req.body;
    const errors = [];

    if(!name) {
        errors.push({
            name: 'Event name is required'
        });
    }

    const eventDate = moment(date);
    const currentDate = moment(Date.now());
    const diff = eventDate.diff(currentDate,'days');

    if(diff <= 5) {
        errors.push({
            date: 'Event must be atleast 6 days from today'
        });
    } else {
        req.body.date = moment(date).utc().format();
    }

    if (!validateCoordinates(location)) {
        errors.push({
            location: 'Location is not valid'
        });
    }

    if(!locationDescription) {
        errors.push({
            locationDescription: 'Location description is required'
        });
    }

    if(!description) {
        errors.push({
            description: 'Event description is required'
        });
    }

    if(!banner) {
        errors.push({
            banner: 'Banner url required'
        });
    }

    if(!isValidObjectId(interest)) {
        errors.push({
            interest: 'Provide a valid interest for your event'
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
                interest: 'Provide a valid interest for your event'
            });
            res.status(500).json({
                message: errors
            });
            return;
        }
        next();
    }).catch((error) => {
        res.status(500).json({
            message: error
        });
    });

};

function validateCoordinates(location) {
    if(location.constructor == Array && location.length == 2) {
        return true;
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
