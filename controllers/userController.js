const jwt           = require('jsonwebtoken');
const crypt         = require('bcryptjs');
const _             = require('lodash');
const config        = require('../config/database');
const User          = require('../models/user');
const Ticket        = require('../models/ticket');
const ErrorMsgs     = require('../error-msgs/users');


const userController = {};

//Get All Users
userController.getAll = (req, res) => {
    User.find({isDeleted: false}).then((users) => {
        res.status(200).json({
            success: true,
            users
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

//Get single user from db
userController.getSingle = (req, res) => {
    User.findById(req.user._id).populate('interests').then((user) => {
        if(user) {
            user = user.toObject();
            user.interests.forEach((interest) => {
                delete interest['__v'];
            });
            delete user['password'];
            delete user['__v'];
            res.status(200).json({
                success: true,
                data: user
            });
        } else {
            res.status(500).json({
                message: ErrorMsgs.userNotFound
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.userNotFound
        });
    });
}

//CREATE user
userController.addSingle = (req, res) => {
    const email     = req.body.email;
    const password  = req.body.password;
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname
    const phone     = req.body.phone;
    const gender    = req.body.gender;
    const interests = req.body.interests;

    crypt.genSalt(10, (err, salt) => {
        crypt.hash(password, salt, (error, hash) => {
            if(error) {
                res.status(500).json({
                    message: ErrorMsgs.createFail
                });
            } else {
                const user = new User({
                    email,
                    password: hash,
                    firstname,
                    lastname,
                    phone,
                    gender,
                    interests
                });
                user.save().then((newUser) => {
                    const token = jwt.sign(newUser, config.secret, {
                        // expiresIn: 604800 //one week
                    });
                    newUser = newUser.toObject();
                    delete newUser['password'];
                    delete newUser['__v'];
                    //generate token
                    res.status(200).json({
                        success: true,
                        data: newUser,
                        token: 'JWT ' + token,
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

//update single user firstname and lastname
userController.updateSingle = (req, res) => {
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname;
    const email  = req.body.email;
    const phone  = req.body.phone;
    const data = {
        firstname,
        lastname,
        email,
        phone
    }
    User.findByIdAndUpdate(req.user._id, data, {new: true}).then((user) => {
        console.log("save successful");
        res.status(200).json({
            success: true,
            data: user
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.updateFail
        });
    });
}

userController.updateInterests = (req, res) => {
    const data = req.body.interests;
    User.findByIdAndUpdate(req.user._id, {interests: data}, {new: true}).then((user) => {
        res.status(200).json({
            success: true,
            data: user
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.updateFail
        });
    });
}

//update single user email
userController.updateSingleEmail = (req, res) => {
    const email = req.body.email;
    User.findByIdAndUpdate(req.user._id, { email }, {new: true}).then((user) => {
        res.status(200).json({
            success: true,
            data: user
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.updateFail
        });
    });
}

//update single user phone
userController.updateSinglePhone = (req, res) => {
    const phone = req.body.phone;
    User.findByIdAndUpdate(req.user._id, { phone }, {new: true}).then((user) => {
        res.status(200).json({
            success: true,
            data: user
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.updateFail
        });
    });
}

//update single user password
userController.updateSinglePassword = (req, res) => {
    const password = req.body.password;
    crypt.genSalt(10, (err, salt) => {
        crypt.hash(password, salt, (error, hash) => {
            if(error) {
                res.status(500).json({
                    message: ErrorMsgs.updateFail
                });
            } else {
                User.findByIdAndUpdate(req.user._id, { password:hash }, {new: true}).then((user) => {
                    res.status(200).json({
                        success: true,
                        data: user
                    });
                })
                .catch((error) => {
                    res.status(500).json({
                        message: ErrorMsgs.updateFail
                    });
                });
            }
        });
    });
}

userController.deleteSingle = (req, res) => {
    User.findByIdAndUpdate(req.user._id, { isDeleted: true }, {new: true}).then((user) => {
        res.status(200).json({
            success: true,
            data: user
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.deleteFail
        });
    });
}

//temporary killswitch
userController.deleteAll = (req, res) => {
    User.remove({}).then((data) => {
        res.status(200).json({
            success: true,
            message: 'removed all',
            data
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: "error on killswitch"
        });
    });
};

userController.authenticateSingle = (req, res) => {
    const email     = req.body.email;
    const password  = req.body.password;

    User.findOne({ email }).then((user) => {
        //no user found
        if(!user) {
            res.status(500).json({
                message: ErrorMsgs.authFail
            });
            return;
        }
        crypt.compare(password, user.password, (error, isMatch) => {
            //error in crypt compare
            if (error) {
                res.status(500).json({
                    message: ErrorMsgs.loginFail
                });
                return;
            }
            //passwords don't match
            if(!isMatch) {
                res.status(500).json({
                    message: ErrorMsgs.authFail
                });
                return;
            }
            //generate token
            const token = jwt.sign(user, config.secret, {
                // expiresIn: 604800 //one week
            });
            //give user their damn token
            res.status(200).json({
                success: true,
                token: 'JWT ' + token,
                user
            });
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.loginFail
        });
    });
}

userController.getTickets = (req, res) => {
    Ticket.find({currentOwner: req.user._id})
    .populate('eventId')
    .then((tickets) => {

        const count = _.countBy(tickets, (ticket) => {
            return ticket.eventId._id;
        });

        uniqTickets = _.uniqBy(tickets, (ticket) => {
            return ticket.eventId._id;
        });

        const events = uniqTickets.reduce((acc, ticket) => {

            const event = {
                eventId: ticket.eventId._id,
                name: ticket.eventId.name,
                dateFrom: ticket.eventId.dateFrom,
                totalTickets: count[ticket.eventId._id],
                singleTicketId:  ticket._id
            }
            acc.push(event);
            return acc;
        },[]);

        res.status(200).json({
            success: true,
            data: events,
        });
    });
}

module.exports = userController;
