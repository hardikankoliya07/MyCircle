const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const md5 = require('md5')
const cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
const session = require('express-session')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const UsersModel = require('../models/user')

module.exports = {

    login: (app) => {

        app.use(cookieSession({
            secret: "session",
            key: "abhH4re5Uf4Rd0KnddSsdf05f3V",
            maxAge: 24 * 60 * 60 * 1000
        }));

        app.use(session({
            secret: "abhH4re5Uf4Rd0KnddS05sdff3V",
            resave: true,
            saveUninitialized: true,
            maxAge: 24 * 60 * 60 * 1000,
            cookie: { secure: true }
        }))

        app.use(flash())
        app.use(cookieParser());

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
        },
            function (email, password, done) {
                UsersModel.findOne({
                    'email': {
                        $regex: '^' + email + '$',
                        $options: 'i'
                    },
                    'password': md5(password),
                }, {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    isDeleted: 1,
                    gender: 1,
                    profile: 1
                }).then(async function (user) {
                    if (!user) {
                        return done(null, false, {
                            message: 'please enter valid login details'
                        })
                    } else {
                        if (user.isDeleted) {
                            return done(null, false, {
                                message: 'Your account is blocked'
                            })
                        }
                        return done(null, user)
                    }
                }).catch(function (err) {
                    return done(null, false, {
                        message: 'Please enter valid login details'
                    })
                })
            })
        )

        passport.serializeUser(function (user, done) {
            console.log('serializeUser');
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            console.log('deserializeUser');
            done(null, user);
        });
    },

    authHelper: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/')
        }
        return next();
    },

    flash: (req, res, next) => {
        let error = req.flash("error");
        let success = req.flash("success");
        if (error.length > 0) {
            res.locals.flash = {
                type: 'error',
                message: error
            }
        }
        if (success.length > 0) {
            res.locals.flash = {
                type: 'success',
                message: success
            }
        }
        return next()
    },

    authUser: (req, res, next) => {
        if (req.user) res.locals.authUser = req.user
        return next()
    }
}