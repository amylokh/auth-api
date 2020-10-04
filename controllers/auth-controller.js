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
    console.log('username: '+ username);
    console.log('password: '+ password);

    User.findOne({$or: [{email: username}, {phone: username}]})
        .then(user=> {
           if (user) {
               bcrypt.compare(password, user.password, function (err, result) {
                   if (err) {
                       console.log('error: ' + err);
                       res.json({error: err});
                   }
                   if (result) {
                       let idtoken = jwt.sign({name: user.name}, 'verySecretValue', {expiresIn: '1h'});
                       console.log('idtoken: '+ idtoken);
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

module.exports = {
    register, login
};
