const Interest = require('../models/interest');

const interestController = {};

interestController.getAll = (req, res) => {
    Interest.find({}).then((interests) => {
        res.status(200).json({
            success: true,
            interests
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: error.toString()
        });
    });
}

interestController.addSingle = (req, res) => {
    const name = req.body.name;
    const interest = new Interest({ name });
    interest.save().then((interest) => {
        res.status(200).json({
            success: true,
            interest
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: error.toString()
        });
    });
}

module.exports = interestController;
