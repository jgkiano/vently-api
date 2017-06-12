const jwt           = require('jsonwebtoken');
const crypt         = require('bcryptjs');
const config        = require('../config/database');
const Manager       = require('../models/manager');
const ErrorMsgs     = require('../error-msgs/managers');

const managerController = {};

managerController.getAll = (req, res) => {
    Manager.find({isDeleted: false}).then((managers) => {
        res.status(200).json({
            success: true,
            managers
        });
    }).catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

//CREATE manager
managerController.addSingle = (req, res) => {
    const email         = req.body.email;
    const password      = req.body.password;
    const firstname     = req.body.firstname;
    const lastname      = req.body.lastname;
    const companyName   = req.body.companyName;
    const phone         = req.body.phone;
    const gender        = req.body.gender;
    const events        = req.body.events;

    crypt.genSalt(10, (err, salt) => {
        crypt.hash(password, salt, (error, hash) => {
            if(error) {
                res.status(500).json({
                    message: ErrorMsgs.createFail
                });
            } else {
                const manager = new Manager({
                    email,
                    password: hash,
                    firstname,
                    lastname,
                    companyName,
                    phone,
                    gender,
                    events
                });
                manager.save().then((newManager) => {
                    newManager = newManager.toObject();
                    delete newManager['password'];
                    delete newManager['__v'];
                    res.status(200).json({
                        success: true,
                        data: newManager
                    });
                })
                .catch((error) => {
                    res.status(500).json({
                        message: error.toString()
                    });
                });
            }
        });
    });
}

managerController.deleteAll = (req, res) => {
    Manager.remove({}).then((data) => {
        res.status(200).json({
            success: true,
            message: 'removed all',
            data
        });
    }).catch((error) => {
        res.status(500).json({
            message: "error on killswitch"
        });
    })
}

module.exports = managerController;
