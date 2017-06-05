const User = require('../models/user');

const userController = {};

let registerErrors = [];

//CREATE user
userController.register = (req, res) => {
    const email     = req.body.email;
    const password  = req.body.password;
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname
    const phone     = req.body.phone;

    //perform validation
    validateEmail(email)
    validatePassword(password)
    validatePhone(phone)

    if(!registerErrors.length) {
        //does user exist?
        User.findOne({ email })
            .then((user) => {
                if(user) {
                    res.status(500).json({
                        message: 'user is already registered'
                    });
                } else {
                    const user = new User({ email, password, firstname, lastname, phone });
                    user.save()
                        .then((newUser) => {
                            res.status(200).json({
                                success: true,
                                data: {
                                    email: newUser.email,
                                    firstname: newUser.firstname,
                                    lastname: newUser.lastname,
                                    phone: newUser.phone,
                                    createdAt: newUser.createdAt
                                }
                            });
                        })
                        .catch((error) => {
                            res.status(500).json({
                                message: error.toString()
                            });
                        });
                }
            })
            .catch((error) => {
                res.status(500).json({
                    message: error.toString()
                });
            });

    } else {
        res.status(500).json({
            message: registerErrors
        });
        //clear errors array
        registerErrors = [];
    }
}

userController.deleteAll = (req, res) => {
    User.remove({})
        .then((data) => {
            res.status(200).json({
                success: true,
                message: 'removed all',
                data
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: error.toString()
            });
        });
};


userController.getAll = (req, res) => {
    User.find({isDeleted: false})
        .then((users) => {
            res.status(200).json({
                success: true,
                users
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: error.toString()
            });
        });
}

userController.getUser = (req, res) => {
    User.findOne({email})
}

//validates email
function validateEmail (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email)) {
        registerErrors.push({
            email: 'wrong email pattern'
        });
    }
}

//Minimum 8 characters at least 1 Alphabet and 1 Number:
function validatePassword (password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
    if(!re.test(password)) {
        registerErrors.push({
            password: 'password is too weak. Must be a minimum of 8 characters at least 1 Alphabet and 1 Number'
        });
    }
}

//validates phone
function validatePhone (phone) {
    const re = /^[7]{1}([0-9]{1}[0-9]{1})?[0-9]{3}?[0-9]{3}$/
    if(!re.test(phone)) {
        registerErrors.push({
            phone: 'wrong phone pattern'
        });
    }
}

module.exports = userController;
