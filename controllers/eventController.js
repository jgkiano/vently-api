const Event     = require('../models/event');
const ErrorMsgs = require('../error-msgs/interests');
const moment    = require('moment');
const axios     = require('axios');
const Keys      = require('../config/keys.js');

const eventController = {};

eventController.getAll = (req, res) => {
    Event.find({isDeleted: false}).then((events) => {
        res.status(200).json({
            success: true,
            events
        });
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

eventController.getSingle = (req, res) => {
    Event.findById(req.params.id).populate('interest').then((event) => {
        if(!event) {
            res.status(500).json({
                message: 'Event not found'
            });
            return;
        }
        const lat = event.location[0];
        const lon = event.location[1];
        const eventDate = moment(event.date);
        const currentDate = moment(Date.now());
        const diff = eventDate.diff(currentDate,'days');
        const day = diff + 1;
        if (diff >= 0 && diff <= 5) {
            //get weather
            axios.get(getWeatherLink(lat, lon)).then((response) => {
                const weather = response.data.list[day].weather[0];
                event = formatEvent(event);
                event.weather = weather;
                getPhyAddress(res, event, lat, lon);
            }).catch((error) => {
                console.log(error.toString());
            })
        } else {
            //not enough data to get weather info so get phy
            event = formatEvent(event);
            getPhyAddress(res, event, lat, lon);
        }
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

function getPhyAddress(res, event, lat, lon) {
    axios.get(getGeoCodeLink(lat, lon)).then( (response) => {
        event.physicalAddress = response.data.results[0].formatted_address
        res.status(200).json({ success: true, event });
    }).catch((error) => { console.log(error); });
}

function formatEvent (event) {
    event = event.toObject();
    event.date = moment(event.date).format('MMMM Do YYYY, h:mm:ss a');
    event.createdAt = moment(event.createdAt).format('MMMM Do YYYY, h:mm:ss a');
    delete event['__v'];
    delete event['isDeleted'];
    delete event.interest['__v'];
    delete event.interest['createdAt'];
    delete event.interest['isDeleted'];
    return event;
}

function getGeoCodeLink(lat, lon) {
    return 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&sensor=true';
}

function getWeatherLink(lat, lon) {
    return 'http://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+Keys.weatherKey+'';
}

module.exports = eventController;
