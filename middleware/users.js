const User = require('../models/user');
const Interest = require('../models/interest');
const Middleware = {};

Middleware.validateRegistration = (req, res, next) => {
    const email     = req.body.email;
    const password  = req.body.password;
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname
    const phone     = req.body.phone;
    const gender    = req.body.gender;
    let interests   = req.body.interests;
    const errors    = [];

    if (!validateEmail(email)) {
        errors.push({
            email: 'wrong email pattern'
        });
    }

    if (!validatePassword(password)) {
        errors.push({
            password: 'password is too weak. Must be a minimum of 8 characters at least 1 Alphabet and 1 Number'
        });
    }

    if (!firstname) {
        errors.push({
            firstname: 'firstname is required'
        });
    }

    if (!lastname) {
        errors.push({
            lastname: 'lastname is required'
        });
    }

    if (!validatePhone(phone)) {
        errors.push({
            phone: 'wrong phone pattern. Must be 722xxx356 format'
        });
    }

    if(!validateGender(gender)) {
        errors.push({
            gender: 'gender is invalid.'
        });
    }

    if(!interests) {
        interests = [];
    }

    if ( interests.constructor == Array ) {
        if(!isValidObjectId(interests)) {
            errors.push({
                interests: 'provide an array of valid interests. Refer to docs'
            });
        }
    } else {
        errors.push({
            interests: 'provide an array of valid interests. Refer to docs'
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
                message: 'user is already registered'
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
                        message: 'invalid interests array. Check interests ids'
                    });
                    return;
                }
                next();
            })
            .catch((error) => {
                res.status(500).json({
                    message: error.toString()
                });
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

Middleware.validateBasicInfo = (req, res, next) => {
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname;
    const errors    = [];
    if (!firstname) {
        errors.push({
            firstname: 'firstname is required'
        });
    }
    if (!lastname) {
        errors.push({
            lastname: 'lastname is required'
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
            message: 'wrong email pattern'
        });
    } else {
        User.findOne({ email }).then((user) => {
            if (user) {
                res.status(500).json({
                    message: 'email address is already registered'
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
            message: 'wrong phone pattern. Must be 722xxx356 format'
        });
    } else {
        User.findOne({ phone }).then((user) => {
            if (user) {
                res.status(500).json({
                    message: 'phone number is already registered'
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
            message: 'password is too weak. Must be a minimum of 8 characters at least 1 Alphabet and 1 Number'
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
            message: 'invalid email and/or password'
        });
        return;
    }
    if(!validatePassword(password)) {
        res.status(500).json({
            message: 'invalid email and/or password'
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

module.exports = Middleware;
