const Event     = require('../models/event');
const ErrorMsgs = require('../error-msgs/interests');
const moment    = require('moment');
const axios     = require('axios');
const Keys      = require('../config/keys.js');

const initialOrigin = [ -1.3106273, 36.8238471];
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
        //calculate time difference
        const eventDate = moment(event.date);
        const currentDate = moment(Date.now());
        const diff = eventDate.diff(currentDate,'days');
        const day = diff + 1;

        //remove un necessary info from event object
        event = formatEvent(event);

        if (diff >= 0 && diff <= 5) {
            //get weather
            getWeatherInfo(res, req, event)
        } else {
            //get phy address
            getPhyAddress(res, req, event);
        }
    }).catch((error) => {
        res.status(500).json({
            message: error.toString()
        });
    });
}

function getWeatherInfo(res, req, event) {
    axios.get(getWeatherLink(event.location[0], event.location[1]))
    .then((response) => {
        event.weather = response.data.list[day].weather[0];
        getPhyAddress(res, req, event);
    }).catch((error) => {
        res.status(500).json({
            message: error.toString()
        });
    });
}

function getPhyAddress(res, req, event) {
    //if request does not have lat and lng provided, just get physical address
    if(!req.query.lat || !req.query.lng) {
        const link = getGeoCodeLink(event.location[0], event.location[1]);
        axios.get(link).then( (response) => {
            event.physicalAddress = response.data.results[0].formatted_address
            res.status(200).json({ success: true, event });
        }).catch((error) => { console.log(error); });
    } else {
        //get all yummy / creepy distance infomation
        const origin = [req.query.lat, req.query.lng];
        const dest = [event.location[0], event.location[1]];
        const link = getDistanceMatrix(origin, dest)
        axios.get(link).then( (response) => {
            event.physicalAddress = response.data.destination_addresses[0];
            event.distance = response.data.rows[0].elements[0].distance.text;
            event.duration = response.data.rows[0].elements[0].duration.text;
            res.status(200).json({ success: true, event });
        }).catch((error) => { console.log(error); });
    }
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

function getDistanceMatrix(origin, dest) {
    return 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+origin[0]+','+origin[1]+'&destinations='+dest[0]+','+dest[1]+'&key='+Keys.distanceMatrixKey+'';
}

module.exports = eventController;
