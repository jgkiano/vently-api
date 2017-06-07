const jwt           = require('jsonwebtoken');
const crypt         = require('bcryptjs');
const config        = require('../config/database');
const User          = require('../models/user');

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
            message: error.toString()
        });
    });
}

//Get single user
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
                message: 'user not found'
            });
        }
    })
    .catch((error) => {
        res.status(500).json({
            message: 'user not found. ID does not match system pattern'
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
                    message: 'error on creating user'
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
                    newUser = newUser.toObject();
                    delete newUser['password'];
                    delete newUser['__v'];
                    res.status(200).json({
                        success: true,
                        data: newUser
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
    const data = {
        firstname,
        lastname
    }
    User.findByIdAndUpdate(req.user._id, data, {new: true}).then((user) => {
        res.status(200).json({
            success: true,
            data: user
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: 'User update failed. Check docs for more info'
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
            message: 'User update failed. Check docs for more info'
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
            message: 'User update failed. Check docs for more info'
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
                    message: 'error on creating user'
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
                        message: 'User update failed. Check docs for more info'
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
            message: 'User delete failed. Check docs for more info'
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
            message: error.toString()
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
                message: 'Incorrect username and/or password'
            });
            return;
        }
        crypt.compare(password, user.password, (error, isMatch) => {
            //error in crypt compare
            if (error) {
                res.status(500).json({
                    message: 'failed to authenticate user'
                });
                return;
            }
            //passwords don't match
            if(!isMatch) {
                res.status(500).json({
                    message: 'Incorrect username and/or password'
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
            message: 'failed to authenticate user'
        });
    });
}

module.exports = userController;
