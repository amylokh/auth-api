const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = (req, res, next) => {

    bcrypt.hash(req.body.password, 10, (err, hashedPassword)=> {
        if (err){
            res.json({error: err});
        }

        let user = new User({
            name: req.body.name,
            email : req.body.email,
            phone: req.body.phone,
            password : hashedPassword
        });
    
        user.save()
            .then(user=>{
                res.json({message: 'User registered successfully!'});
            })
            .catch(err=> {
                res.json({message: 'An error occurred while registering new user'});
            })
    });
};

const login = (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({$or: [{email: username}, {phone: username}]})
        .then(user=> {
           if (user) {
               bcrypt.compare(password, user.password, function (err, result) {
                   if (err) {
                       console.log('error: ' + err);
                       res.json({error: err});
                   }
                   if (result) {
                       let idtoken = jwt.sign({email: user.email}, 'verySecretValue', {expiresIn: '1h'});
                       res.json({
                           message: 'User login successful',
                           idtoken
                       });
                   }
                   else {
                       res.json({message: 'Incorrect password'});
                   }
               })
           }
           else {
               res.json({message: 'No user found'});
           }
        })
        .catch(err=>{
            console.log('Some error occurred', err);
        })
};

const verify = (req, res, next) => {
    try {
        const idtoken = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(idtoken, 'verySecretValue');
        console.log('idtoken: '+ idtoken);
        console.log('decode: '+ JSON.stringify(decode));

        if (req.body.email === decode.email) {
            res.json({message: 'Valid authentication token'});
        }
    }
    catch(err) {
        res.json({message: 'Invalid authentication token provided.'});
    }
}

module.exports = {
    register, login, verify
};
