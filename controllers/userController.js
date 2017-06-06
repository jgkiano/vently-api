const User = require('../models/user');

const userController = {};

//Get All Users
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

//Get single user
userController.getSingle = (req, res) => {
    User.findById(req.params.id).then((user) => {
        if(user) {
            user = user.toObject();
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
    const gender   = req.body.gender;

    const user = new User({ email, password, firstname, lastname, phone, gender });
    user.save()
        .then((newUser) => {
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

//update single user firstname and lastname
userController.updateSingle = (req, res) => {
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname;
    const data = {
        firstname,
        lastname
    }
    User.findByIdAndUpdate(req.params.id, data, {new: true}).then((user) => {
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
    User.findByIdAndUpdate(req.params.id, { email }, {new: true}).then((user) => {
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
    User.findByIdAndUpdate(req.params.id, { phone }, {new: true}).then((user) => {
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
    User.findByIdAndUpdate(req.params.id, { password }, {new: true}).then((user) => {
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

userController.deleteSingle = (req, res) => {
    User.findByIdAndUpdate(req.params.id, { isDeleted: true }, {new: true}).then((user) => {
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

module.exports = userController;
