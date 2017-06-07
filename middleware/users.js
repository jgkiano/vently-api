const User          = require('../models/user');
const Interest      = require('../models/interest');
const ErrorMsgs     = require('../error-msgs/users');
const Middleware    = {};

Middleware.validateRegistration = (req, res, next) => {
    const email     = req.body.email;
    const password  = req.body.password;
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname;
    const phone     = req.body.phone;
    const gender    = req.body.gender;
    let interests   = req.body.interests;
    const errors    = [];

    if (!validateEmail(email)) {
        errors.push({
            email: ErrorMsgs.emailPattern
        });
    }

    if (!validatePassword(password)) {
        errors.push({
            password: ErrorMsgs.weakPassword
        });
    }

    if (!firstname) {
        errors.push({
            firstname: ErrorMsgs.firstnameReq
        });
    } else {
        req.body.firstname = toTitleCase(req.body.firstname)
    }

    if (!lastname) {
        errors.push({
            lastname: ErrorMsgs.lastnameReq
        });
    } else {
        req.body.lastname = toTitleCase(req.body.lastname)
    }

    if (!validatePhone(phone)) {
        errors.push({
            phone: ErrorMsgs.phonePattern
        });
    }

    if(!validateGender(gender)) {
        errors.push({
            gender: ErrorMsgs.genderInvalid
        });
    }

    if(!interests) {
        interests = [];
    }

    if ( interests.constructor == Array ) {
        if(!isValidObjectId(interests)) {
            errors.push({
                interests: ErrorMsgs.interestsInvalid
            });
        }
    } else {
        errors.push({
            interests: ErrorMsgs.interestsInvalid
        });
    }

    if(errors.length > 0) {
        res.status(500).json({
            message: errors
        });
        return;
    }

    User.findOne({ $or: [{ email }, {phone} ] }).then((user) => {
        if (user) {
            res.status(500).json({
                message: ErrorMsgs.userExists
            });
            return;
        }
        if(interests.length > 0) {
            for (var i = 0; i < interests.length; i++) {
                interests[i] = {
                    _id: interests[i]
                }
            }
            Interest.find({ $or: interests}).then((_interests) => {
                if(interests.length !== _interests.length) {
                    res.status(500).json({
                        message: ErrorMsgs.interestsArrayInvalid
                    });
                    return;
                }
                next();
            })
            .catch((error) => {
                res.status(500).json({
                    message: ErrorMsgs.catchError
                });
            });
        } else {
            next();
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: ErrorMsgs.catchError
        });
    });
}

Middleware.validateBasicInfo = (req, res, next) => {
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname;
    const errors    = [];
    if (!firstname) {
        errors.push({
            firstname: ErrorMsgs.firstnameReq
        });
    }
    if (!lastname) {
        errors.push({
            lastname: ErrorMsgs.lastnameReq
        });
    }
    if(errors.length > 0) {
        res.status(500).json({
            message: errors
        });
    } else {
        next();
    }
}

Middleware.validateEmail = (req, res, next) => {
    const email = req.body.email;
    if(!validateEmail(email)) {
        res.status(500).json({
            message: ErrorMsgs.emailPattern
        });
    } else {
        User.findOne({ email }).then((user) => {
            if (user) {
                res.status(500).json({
                    message: ErrorMsgs.userExists
                });
            } else {
                next();
            }
        })
        .catch((error) => {
            res.status(500).json({
                message: error.toString()
            });
        });
    }
}

Middleware.validatePhone = (req, res, next) => {
    const phone = req.body.phone;
    if(!validatePhone(phone)) {
        res.status(500).json({
            message: ErrorMsgs.phonePattern
        });
    } else {
        User.findOne({ phone }).then((user) => {
            if (user) {
                res.status(500).json({
                    message: ErrorMsgs.phoneExists
                });
            } else {
                next();
            }
        })
        .catch((error) => {
            res.status(500).json({
                message: error.toString()
            });
        });
    }
}

Middleware.validatePassword = (req, res, next) => {
    const password = req.body.password;
    if(!validatePassword(password)) {
        res.status(500).json({
            message: ErrorMsgs.weakPassword
        });
    } else {
        next();
    }
}

Middleware.validateAuthentication = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!validateEmail(email)) {
        res.status(500).json({
            message: ErrorMsgs.authFail
        });
        return;
    }
    if(!validatePassword(password)) {
        res.status(500).json({
            message: ErrorMsgs.authFail
        });
        return;
    }
    next();
}

function validateEmail(email) {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(email);
}

function validatePhone(phone) {
    const phonePattern = /^[7]{1}([0-9]{1}[0-9]{1})?[0-9]{3}?[0-9]{3}$/;
    return phonePattern.test(phone);
}

function validatePassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordPattern.test(password);
}

function validateGender(gender) {
    const genderPattern = /^male$|^female$|^other$/;
    return genderPattern.test(gender);
}

function isValidObjectId(array) {
    const hexPattern = /^[0-9a-fA-F]{24}$/;
    for (var i = 0; i < array.length; i++) {
        if (!hexPattern.test(array[i])) {
            return false;
        }
    }
    return true;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = Middleware;
