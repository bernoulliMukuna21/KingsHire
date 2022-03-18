//var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var ObjectId = require('mongodb').ObjectID;
var UserModel = require('../models/UserModel');

let domainName = 'https://www.unilance.co.uk'; // 'http://localhost:3000'

module.exports = function(passport) {

    // Local Passport Authentication
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

            // Find User in the database
            UserModel.findOne({
                email: email
            }).then(user=>{
                if(!user){
                    // user email is not found in the database
                    return done(null, false, { message: 'Not-registered' });
                }
                // check if the email is linked to a facebook or google account
                if(user.email && user.authentication.authID){
                    return done(null, false, {message: 'facebook-google'});
                }

                user.comparePassword(password, (err, passwordMatch)=>{

                    if (err){
                        reject({
                            'status': 'Error',
                            'data': err
                        });
                        throw err;
                    }
                    if (passwordMatch){
                        return done(null, user);
                    }else{
                        return done(null, false, {message: 'incorrect-password'});
                    }
                })
            });
        })
    );

    /*#################  Oauth Helper function ##############*/
    function profileValidation(profile, done){
        /*
        * This function will be used to help do some basic checking of the profile
        * of the user facebook, google and other social accounts' details.
        * */

        if (profile.emails == undefined){
            // in case the user does not want to provide email
            // will return an error that will rerequest it

            return done(null, false, {message: 'email-required'});
        }

        let current_authentication =
            {
                authName: profile.idName,
                authID: profile.id
            };

        // Find the details of the user in the database
        UserModel.findOne({
            /*
            * The first step is to go through the database and find the following
            * unique details of the user: email and id (facebook or google)
            * */

            $or: [{
                email: profile.emails[0].value
            }, {
                authentication: current_authentication
            }]
        }).then(user=>{
            if(user === null){
                /*
                * if each of the details above of the user returns null, this means that
                * the current user is not registered. Then, the profile must be returned
                * */

                // add user social network details to the profile
                profile.authDetails = current_authentication;
                return done(null, profile);
            }
            else if(user.email){
                /*
                * Each user in the database (whether they signed up with any other
                * social accounts) has a unique email address. If the current user
                * returns an email adress, this means that they have already been
                * signed up. Therefore, further checkings are required.
                * */
                if(user.authentication.authID &&
                    user.authentication.authName === current_authentication.authName){
                    /*
                    * This current email is linked to a social network account
                    *  */

                    return done(null, user, {message: 'socialN-account'})
                }
                else{
                    /*
                    * This current email is not linked to any of the social account.
                    * However, this email has already been registered.
                    * */

                    return done(null, false, {message: 'email-in-use'});
                }
            }
        }).catch(error => done(null, false, {message: 'error'}))
    }

    //GoogleStrategy Passport Authentication
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_ID,
        callbackURL: `${domainName}/users/google-authentication/callback` // 'http://localhost:3000/users/google-authentication/callback'
        },
        function (accessToken, refreshToken, profile, done) {
            profile.idName = 'google';
            profileValidation(profile, done);
        })
    );

    passport.serializeUser(function(user, done) {

        // setting id cookie
        // in the user's browser
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {

        //  get the id from the cookie and use it to get user's information
        UserModel.findOne({_id: ObjectId(id)}, function (err, user) {
            done(err, user);
        });
    });
};