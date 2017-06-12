const express       = require('express');
const routes        = express();

//user routes
const usersRoute    = require('./users');
routes.use('/users', usersRoute);

//eventCategories or interests routes
const interestsRoute    = require('./interests');
routes.use('/interests', interestsRoute);

//events routes
const eventsRoute    = require('./events');
routes.use('/events', eventsRoute);

//event managers route
const managersRoute    = require('./managers');
routes.use('/managers', managersRoute);

module.exports = routes;
