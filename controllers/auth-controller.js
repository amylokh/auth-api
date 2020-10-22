const User = require('../models/User');
const RefreshConfig = require('../models/RefreshConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const register = (req, res, next) => {

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
            res.json({ error: err });
        }

        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            refreshConfigId : mongoose.Types.ObjectId()
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

                        var date = new Date();
                        date.setDate(date.getDate() + 3);

                        let newRefreshConfig = new RefreshConfig({
                            _id: mongoose.Types.ObjectId(user.refreshConfigId),
                            token: {
                                refreshToken, 
                                expiresIn: date
                            }
                        });

                    // push new refresh token if it doesn't exist or update the existing one
                    RefreshConfig.findOneAndUpdate({email : user.email}, newRefreshConfig, {upsert: true})
                        .then(refreshConfig => {
                            console.log("New refresh config created/updated successfully");
                        })
                        .catch(err=> {
                            console.log("Error occurred while creating/updating refresh config: " + err);
                        });

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
        const refreshToken = req.body.refreshToken;

        const decode = jwt.verify(accessToken, 'accessTokenSecretKey');
        jwt.verify(refreshToken, 'refreshTokenSecretKey');

        // check if email is matching & refresh token exists in db
        if (req.body.email === decode.email) {
            RefreshConfig.findOne({"token.refreshToken": refreshToken})
                .then(result => {
                    if (result) {
                        res.status(200).json({ message: 'Valid authentication token' });
                    }
                    else {
                        res.status(400).json({ message: 'Invalid authentication token provided.' });
                    }
                })
                .catch(err=> {
                    console.log(err);
                    res.status(500).json({message: 'Internal server error'});
                })
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

        //if refresh token exists then update it in db & send it in response, else throw invalid refresh token provided
        RefreshConfig.findOne({"token.refreshToken": refreshToken})
            .then(result => {
                if (result) {
                    const accesstoken = jwt.sign({ email: decode.email }, 'accessTokenSecretKey', { expiresIn: '5m' });
                    const newRefToken = jwt.sign({ email: decode.email }, 'refreshTokenSecretKey', {expiresIn: '3d'});

                    var date = new Date();
                    date.setDate(date.getDate() + 3);

                    let newRefreshConfig = new RefreshConfig({
                        token: {
                            refreshToken: newRefToken,
                            expiresIn: date
                        }
                    });

                    RefreshConfig.findOneAndUpdate({email : decode.email}, newRefreshConfig)
                        .then(res=> {
                            console.log("Refresh token updated successfully");
                        })
                        .catch(err=> {
                            console.log(err);
                        })

                    res.json({accesstoken, "refreshToken": newRefToken});
                }
                else {
                    res.status(400).json({message : 'Invalid refresh token provided'});
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({message : 'Internal server error'});
            })
        
    }
    catch(err) {
        res.status(400).json({ message: 'Invalid refresh token provided.' });
    }
}

const logout = (req, res, next) => {
    try {
        const refreshToken = req.query.refreshToken;
        jwt.verify(refreshToken, 'refreshTokenSecretKey');

        RefreshConfig.findOneAndDelete({"token.refreshToken": refreshToken})
            .then(result => {
                if(result) {
                    res.status(200).json({message: 'Logged out successfully'});
                }
                else {
                    res.status(400).json({message: 'Invalid refresh token provided'});
                }
            })
            .catch(err=> {
                console.log(err);
                res.status(400).json({message: 'Invalid refresh token provided'});
            })
    }
    catch(err) {
        res.status(400).json({ message: 'Invalid refresh token provided.' });
    }
}

module.exports = {
    register, login, verify, refresh, logout
};
