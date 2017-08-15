const moment    = require('moment');
const axios     = require('axios');
const Event     = require('../models/event');
const Manager   = require('../models/manager');
const ErrorMsgs = require('../error-msgs/events');
const Keys      = require('../config/keys.js');

const eventController = {};

eventController.getAll = (req, res) => {

    if(req.query.lat && req.query.lng) {
        Event.find({isDeleted: false})
        .where('dateFrom').gte(Date.now())
        .populate('interest')
        .then((events) => {
            getNearEvents(req, res, events)
        })
        .catch((error) => {
            res.status(500).json({
                message: ErrorMsgs.catchError
            });
        });
    } else {
        Event.find({isDeleted: false})
        .where('dateFrom').gte(Date.now())
        .where('interest').in(req.user.interests)
        .sort({dateFrom: 'asc'})
        .then((events) => {
            events.forEach((event, index) => {
                events[index] = formatEvent(event);
            });
            res.status(200).json({
                success: true,
                events
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: ErrorMsgs.catchError
            });
        });
    }
}

eventController.getSingle = (req, res) => {
    Event.findById(req.params.id).populate('interest')
        .populate('manager').then((event) => {
        if(!event) {
            res.status(500).json({
                message: ErrorMsgs.eventNot
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
            getWeatherInfo(res, req, day, event)
        } else {
            //get phy address
            getPhyAddress(res, req, event);
        }
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.eventNot
        });
    });
}

eventController.addSingle = (req, res) => {
    const {
        name,
        dateFrom,
        dateTo,
        location,
        locationDescription,
        description,
        banner,
        price,
        interest,
        manager
    } = req.body;
    const event = new Event({ name, dateFrom, dateTo, location, locationDescription, description, banner, price, interest, manager });
    event.save().then((event) => {
        updateManagerEvent(event);
        res.status(200).json({
            success: true,
            event
        });
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError,
            error: error.toString()
        });
    });
}

eventController.updateSingle = (req, res) => {
    const data = {
        name                : req.body.name,
        date                : req.body.date,
        location            : req.body.location,
        locationDescription : req.body.locationDescription,
        description         : req.body.description,
        banner              : req.body.banner,
        price               : req.body.price,
        interest            : req.body.interest
    };
    Event.findByIdAndUpdate(req.params.id, data, { new: true }).then((event) => {
        res.status(200).json({
            success: true,
            event: formatEvent(event)
        });
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    })
}

eventController.deleteSingle = (req, res) => {
    Event.findByIdAndUpdate(req.params.id, {isDeleted: true}, {new: true}).then((event) => {
        deleteManagerEvent(event)
        res.status(200).json({
            success: true
        });
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

eventController.deleteAll = (req, res) => {
    Event.remove({}).then((data) => {
        deleteAllManagerEvents();
        res.status(200).json({
            success: true,
            message: 'removed all',
            data
        });
    }).catch((error) => {
        res.status(500).json({
            message: "error on killswitch"
        });
    });
}

function updateManagerEvent(event) {
    Manager.findByIdAndUpdate(event.manager, { $push: { events: event._id } }, {new: true}).then((manager) => {
        console.log(manager)
    }).catch((error) => {
        console.log(error)
    });
}

function deleteManagerEvent(event) {
    Manager.findByIdAndUpdate(event.manager, { $pop: { events: event._id } }, {new: true}).then((manager) => {
        console.log(manager)
    }).catch((error) => {
        console.log(error)
    });
}
//temporary
function deleteAllManagerEvents() {
    Manager.where({ }).update({ $set: { events: [] }}).exec();
}

function getNearEvents(req, res, events) {
    console.log("called");
    const origin = [req.query.lat, req.query.lng];
    let closeEvents = [];

    events.forEach((event, index, array) => {
        const dest = [event.location[0], event.location[1]];
        const link = getDistanceMatrix(origin, dest);
        axios.get(link).then((response) => {
            if(response.data.rows[0].elements[0].distance) {
                if(response.data.rows[0].elements[0].distance.value <= 10000) {
                    event.distance = response.data.rows[0].elements[0].distance.text;
                    event.duration = response.data.rows[0].elements[0].duration.text;
                    closeEvents.push(event);
                }
                if(index == array.length -1) {
                    res.status(200).json({
                        success: true,
                        events: closeEvents
                    });
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    });
}

function getWeatherInfo(res, req, day, event) {
    axios.get(getWeatherLink(event.location[0], event.location[1]))
    .then((response) => {
        event.weather = parseWeatherResponse(response, day);
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
            event.physicalAddress = parseGeoCodeResponse(response);
            res.status(200).json({ success: true, event });
        }).catch((error) => {
            res.status(500).json({
                message: error.toString()
            });
        });
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
    event.createdAt = moment(event.createdAt).format('MMMM Do YYYY, h:mm a');
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

function parseWeatherResponse(response, day) {
    return response.data.list[day].weather[0];
}

function parseGeoCodeResponse(response) {
    return response.data.results[0].formatted_address;
}

module.exports = eventController;
