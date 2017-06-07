const express       = require('express');
const bodyParser    = require('body-parser');
const mongoose      = require('mongoose');
const passport      = require('passport');
const config        = require('./config/database');
const routes        = require('./routes');

//connecting to mongo
mongoose.connect(config.database, {}, function(error) {
    if(error) {
        console.log('failed to conntect to mongo');
    } else {
        console.log('successfully connected to mongo');
    }
});

const app = express();

//parse application/json
app.use(bodyParser.json());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use((err, req, res, next) => {
    console.log(err)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(500).json({
            message: 'Invalid JSON format'
        });
    }
});

//default route
app.get('/', (req, res) => {
    res.status(500).json({
        message: 'invalid entry point, refer to docs'
    });
});

//everything on /api route
app.use('/api', routes);

//404 routes
app.get('*', (req, res) => {
    res.status(500).json({
        message: 'invalid entry point, refer to docs'
    });
});

app.post('*', (req, res) => {
    res.status(500).json({
        message: 'invalid entry point, refer to docs'
    });
});

//start the server on 3000
app.listen(3000, () => {
    console.log('Running on port 3000');
});
