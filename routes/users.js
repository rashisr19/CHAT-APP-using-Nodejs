const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedInUsers } = require('../config/auth');

const User = require('../models/User');

router.get('/login', (req, res, next) =>{
    res.render('login');
});

router.get('/register', (req, res, next) =>{
    res.render('register');
});

router.post('/register', (req,res) => {
    const {fname, lname, email, password1, password2} = req.body;
    let errors = [];

    //CHECk FOR ERRORS
    //check for all the required fields
    if(!fname || !lname || !email || !password1 || !password2){
        errors.push({ msg : 'Fill in all the fields'});
    }

    //check password match
    if(password1 !== password2){
        errors.push({msg:'Passwords do not match'});
    }

    //check password length > 6
    if(password1.length < 6){
        errors.push({msg : 'Password too small'});
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            fname,
            lname,
            email,
            password1,
            password2
        })
    }
    else{
        //VALIDATION PASS
        User.findOne({ email : email})
        .then((user) => {
            //USER EXISTS
            if(user){
                errors.push({ msg : 'Email already registered'});
                res.render('register', {
                    errors,
                    fname,
                    lname,
                    email,
                    password1,
                    password2
                })
            }
            else{
                const newUser = new User({
                    fname,
                    lname,
                    email,
                    password: password1
                });

                //HASH PASSWORD
                bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newUser.password, salt, (err, hash)=> {
                    if (err) throw err;

                    //SET PASSWORD TO HASHED    
                    newUser.password = hash;
                    newUser.save()
                    .then(user => {
                        req.flash('success_msg', 'You are now registered and can log in');
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
                }))
            }
        })
        .catch(err => console.log(err));
        
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect : '/dashboard',
        failureRedirect : '/users/login',
        failureFlash : true
    })(req,res,next);
});

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


router.get('/changepassword', ensureAuthenticatedInUsers, (req, res, next) => {
    res.render('changePassword');
});

router.post('/changepassword', (req, res, next) => {
    const {email, oldpassword, password1, password2} = req.body;
    let errors = [];

    //CHECk FOR ERRORS
    //check for all the required fields
    if(!email || !oldpassword || !password1 || !password2){
        errors.push({ msg : 'Fill in all the fields'});
    }

    //check password match
    if(password1 !== password2){
        errors.push({msg:'Passwords do not match'});
    }

    //check password length > 6
    if(password1.length < 6){
        errors.push({msg : 'Password too small'});
    }

    if(errors.length > 0){
        res.render('changePassword', {
            errors,
            email,
            oldpassword,
            password1,
            password2
        })
    }
    else{
        User.findOne({ email : email})
        .then((user) => {
            //USER EXISTS
            if(!user){
                errors.push({ msg : 'This email is not registered'});
                res.render('changePassword', {
                    errors,
                    email,
                    oldpassword,
                    password1,
                    password2
                })
            }
            else{
                //HASH PASSWORD
                bcrypt.compare(oldpassword, user.password, function(err, result) {
                    if(result){
                        bcrypt.genSalt(10, (err,salt) => bcrypt.hash(password1, salt, (err, hash)=> {
                            if (err) throw err;

                            user.password = hash;
                            user.save()
                            .then(user => {
                                req.flash('success_msg', 'Password has been successfully changed. Please log in again to continue.');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                        }))
                    }
                    else{
                        errors.push({ msg : 'Password you entered is incorrect'});
                        res.render('changePassword', {
                            errors,
                            email,
                            oldpassword,
                            password1,
                            password2
                        })
                    }
                });
            }
        })
        .catch(err => console.log(err));    
    }
});

module.exports = router;