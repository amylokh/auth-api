const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = (req, res, next) => {

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
            res.json({ error: err });
        }

        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword
        });

        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    res.status(400).json({ message: 'Email already exists' });
                }
                else {
                    newUser.save()
                        .then(user => {
                            res.json({ message: 'User registered successfully!' });
                        })
                        .catch(err => {
                            if (err.name === 'ValidationError') {
                                res.status(400).json({message: 'Bad Request'});
                            }
                            else {
                                res.status(500).json({ message: 'An error occurred while registering new user' });
                            }
                        })
                }
            })
            .catch(err => {
                res.status(500).json({ message: 'An error occurred while finding existing username' });
            })
    });
};

const login = (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ $or: [{ email: username }, { phone: username }] })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        console.log('error: ' + err);
                        res.status(500).json({ error: 'Internal Server error' });
                    }
                    if (result) {
                        let accesstoken = jwt.sign({ email: user.email }, 'accessTokenSecretKey', { expiresIn: '5m' });
                        let refreshToken = jwt.sign({ email: user.email }, 'refreshTokenSecretKey', {expiresIn: '3d'});

                        // push refresh token to refresh token config with user ID
                        res.json({
                            message: 'User login successful',
                            accesstoken,
                            refreshToken
                        });
                    }
                    else {
                        res.status(400).json({ message: 'Incorrect password' });
                    }
                })
            }
            else {
                res.status(404).json({ message: 'No user found' });
            }
        })
        .catch(err => {
            console.log('Some error occurred', err);
        })
};

const verify = (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(accessToken, 'accessTokenSecretKey');

        if (req.body.email === decode.email) {
            res.json({ message: 'Valid authentication token' });
        }
        else {
            res.status(400).json({ message: 'Invalid authentication token provided.' });
        }
    }
    catch (err) {
        res.status(400).json({ message: 'Invalid authentication token provided.' });
    }
}

const refresh = (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;
        const decode = jwt.verify(refreshToken, 'refreshTokenSecretKey');

        let accesstoken = jwt.sign({ email: decode.email }, 'accessTokenSecretKey', { expiresIn: '50s' });
        let refToken = jwt.sign({ email: decode.email }, 'refreshTokenSecretKey', {expiresIn: '2m'});
        
        //push refresh token to refresh token config with user ID
        res.json({accesstoken, "refreshToken": refToken});
    }
    catch(err) {
        res.status(400).json({ message: 'Invalid refresh token provided.' });
    }
}

module.exports = {
    register, login, verify, refresh
};
