const Interest = require('../models/interest');
const ErrorMsgs = require('../error-msgs/interests');

const interestController = {};

interestController.getAll = (req, res) => {
    Interest.find({isDeleted: false}).then((interests) => {
        res.status(200).json({
            success: true,
            interests
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

interestController.getSingle = (req, res) => {
    Interest.findById(req.params.id).then((interest) => {
        if(interest) {
            res.status(200).json({
                success: true,
                interest
            });
        } else {
            res.status(500).json({
                message: ErrorMsgs.interestNotFound
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

interestController.addSingle = (req, res) => {
    const name = req.body.name;
    const icon = req.body.icon;
    const interest = new Interest({ name, icon });
    interest.save().then((interest) => {
        res.status(200).json({
            success: true,
            interest
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

interestController.updateSingle = (req, res) => {
    const name = req.body.name;
    Interest.findByIdAndUpdate(req.params.id, { name }, { new: true }).then((interest) => {
        if(interest) {
            res.status(200).json({
                success: true,
                interest
            });
        } else {
            res.status(500).json({
                message: ErrorMsgs.interestNotFound
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

interestController.deleteSingle = (req, res) => {
    Interest.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true }).then((interest) => {
        if(interest) {
            res.status(200).json({
                success: true,
                interest
            });
        } else {
            res.status(500).json({
                message: ErrorMsgs.interestNotFound
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    })
}

interestController.deleteAll = (req, res) => {
    Interest.remove({}).then((data) => {
        res.status(200).json({
            success: true,
            message: 'removed all',
            data
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

module.exports = interestController;
