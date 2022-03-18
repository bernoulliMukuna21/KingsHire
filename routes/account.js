/*
    * Author: Bernoulli Mukuna
    * created: 10/05/2020
*/
var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var UpdateProfileChecker = require('../public/javascripts/profileUpdateController');
var UserModel = require('../models/UserModel');
var BookingModel = require('../models/BookingModel');
var { ensureAuthentication } = require('../bin/authentication');
var { emailEncode, emailDecode } = require('../bin/encodeDecode');
var { base64ToImageSrc, imageToDisplay } = require('../bin/imageBuffer');
var { numberOfDaysSince, groupByKey } = require('../bin/general-helper-functions');

//let domainName = 'http://localhost:3000';
let domainName = 'https://www.unilance.co.uk';

// Set Storage Engine
//destination: './public/images/uploads',
let storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now()
            + path.extname(file.originalname));
    }
});

let multerUserProfilePicture = multer({
    storage: storage
}).single('user_profile_picture');


router.get('/', ensureAuthentication, function (req, res, next) {
    console.log('I am inside the account function')
    req.flash('error_message', 'Please login to access your account');
    res.send(req.user);//res.redirect('/users/login');
});

router.get('/client/:this_user', ensureAuthentication , async (req,
                                                               res, next) => {
    let loggedInUser = req.user;
    let loggedInUser_imageSrc = '';

    /* The following variables are used to help with the messasging setup
    * for two users. 'messageIdHTML' signals that there is an initiation of
    * the message from another user, so we have to show the message section in
    * the HTML. 'userToMessage' is the unique of the user to message.
    * */
    let userToMessage, userToMessageUniqueKey, userToMessageImageSrc, messageIdHTML;
    let booking_id, newBookingDetails;

    // Get the picture of the current logged in client
    loggedInUser_imageSrc = imageToDisplay(loggedInUser);

    // Messaging setup
    userToMessageUniqueKey = req.query.receiverKey;

    if (userToMessageUniqueKey) {
        try {
            userToMessage = await UserModel.find({
                email: emailDecode(userToMessageUniqueKey)}
            );
            if (userToMessage){
                userToMessage = userToMessage[0];
                userToMessageImageSrc = imageToDisplay(userToMessage);
                messageIdHTML= 'show-user-messages';
            }
        } catch (error) {
            return next(error);
        }
    }

    // Booking setup
    let clientIdFromURL = req.params.this_user;
    if(emailEncode(loggedInUser.email) === clientIdFromURL){
        BookingModel.aggregate([
            { $match: {
                    $and:
                        [
                            { 'customer.uuid': clientIdFromURL },
                            { $or:
                                    [
                                        { paid: true },
                                        { bookingType: 'request_booking' }
                                    ]
                            }
                        ]
                }
            },
            { $sort: { creationDate : 1} }
        ]).then( allBookings => {
            res.render('account_client', {
                loggedInUser,
                isLogged: req.isAuthenticated(),
                loggedInUser_imageSrc,
                allBookings,
                emailEncode,
                userToMessageUniqueKey,
                messageIdHTML,
                userToMessage,
                userToMessageImageSrc
            });
        }).catch ( error => {
            console.log(error)
            return next(error);
        })
    }
})

router.get('/freelancer/:this_user', async function (req, res, next) {
    let loggedInUser, freelancerUser;
    let userToMessageUniqueKey, messageIdHTML;
    let freelancerSubscriptionStatus;
    let allBookingToFreelancer;

    let loggedInUser_imageSrc = '';
    let freelancerIdFromURL = req.params.this_user;
    let currentFreelancerEmail = emailDecode(freelancerIdFromURL);
    let isLogged = req.isAuthenticated();

    if (isLogged) {
        loggedInUser = req.user;

        if(freelancerIdFromURL === emailEncode(loggedInUser.email)){

            // Message Initiation setup
            userToMessageUniqueKey = req.query.receiverKey;
            if (userToMessageUniqueKey) {
                messageIdHTML = 'show-user-messages';
            }

            // Booking Made to Freelancer retrieval
            try{
                ///allBookingToFreelancer = await BookingModel.find({'supplier.uuid': freelancerIdFromURL});
                allBookingToFreelancer = await BookingModel.aggregate(
                    [
                        { $match:
                                {
                                    $and:
                                        [
                                            { 'supplier.uuid': freelancerIdFromURL },
                                            { $or:
                                                    [
                                                        { paid: true },
                                                        { bookingType: 'request_booking' }
                                                    ]
                                            }
                                        ]
                                }
                        },
                        { $sort: { dueDateTime : 1} }
                    ]
                )
            }catch ( error ) {
                console.log(error)
                return next(error);
            }
            // Group the project by statuses
            allBookingToFreelancer = groupByKey(allBookingToFreelancer, 'freelancer');
        }
    }
    try {
        freelancerUser = await UserModel.find({email: currentFreelancerEmail});
        freelancerUser = freelancerUser[0];

        loggedInUser_imageSrc = imageToDisplay(freelancerUser);
        let trailDays = 30;

        if(freelancerUser.is_subscribed){
            trailDays = 0;
            freelancerSubscriptionStatus = 'active';
        }else{
            let numberOfDaysSinceJoining = numberOfDaysSince(freelancerUser.joiningDate);

            if(numberOfDaysSinceJoining > trailDays){
                // They have used their trial days
                trailDays = 0;
                freelancerSubscriptionStatus = 'not-available';

            }else{
                // They are yet to use their trail period.

                trailDays = trailDays - numberOfDaysSinceJoining;
                freelancerSubscriptionStatus = 'trial';
            }
        }

        res.render('account', {
            isLogged, // The user accessing this page is logged in?
            freelancerUser, // The freelancer - profile owner
            loggedInUser, // Details of the logged in user
            loggedInUser_imageSrc,
            emailEncode,
            imageToDisplay,
            messageIdHTML,
            userToMessageUniqueKey,
            freelancerSubscriptionStatus,
            trailDays,
            allBookingToFreelancer
        });
    }catch ( error ) {
        console.log(error)
        return next(error);
    }
});

// client information update
router.put('/client/update', ensureAuthentication, multerUserProfilePicture, async function (req, res, next) {
    try{

        let clientInformationChecker = new UpdateProfileChecker(req.user, req.body,
            req.file, 'client');

        let updateInfos = await clientInformationChecker.checkLoginStrategyAndReturnInformation();

        if(Object.keys(updateInfos.updateErrors).length>0){
            /*
            * If the object of the errors is bigger than 0, the update form
            * contains some errors.
            * */

            res.status(404).send(Object.values(updateInfos.updateErrors));

        }else{
            /*
            * When there are no errors, the next thing that happens is updating
            * the database for the using the user's current details.
            * */

            let upgradeUser = updateInfos.updateUser;
            let this_object = JSON.stringify(upgradeUser);
            this_object = JSON.parse(this_object);
            this_object.profileImageSrc = imageToDisplay(upgradeUser);

            upgradeUser.save(function (error) {
                if (error) throw error;
                else{
                    res.json(this_object);
                }
            });
        }

    }catch ( error ) {
        return next(error);
    }

})

// freelancer information update
router.put('/freelancer/update', ensureAuthentication, multerUserProfilePicture, async function (req, res, next) {
    try{

        let freelancerInformationChecker = new UpdateProfileChecker(req.user, req.body,
            req.file, 'freelancer');

        let updateInfos = await freelancerInformationChecker.checkLoginStrategyAndReturnInformation();

        if(Object.keys(updateInfos.updateErrors).length>0){
            /*
            * If the object of the errors is bigger than 0, the update form
            * contains some errors.
            *  */

            res.status(404).send(Object.values(updateInfos.updateErrors));


        }else{
            /*
            * When there are no errors, the next thing that happens is updating
            * the database for the using the user's current details.
            * */
            let upgradeFreelancer = updateInfos.updateUser;
            let freelancerObject = JSON.stringify(upgradeFreelancer);
            freelancerObject = JSON.parse(freelancerObject);

            upgradeFreelancer.save(function (error) {
                if (error) throw error;
                else{
                    freelancerObject.profile_picture = imageToDisplay(upgradeFreelancer);
                    res.json(freelancerObject);
                }
            });
        }

    }catch ( error ) {
        return next(error);
    }
});

// Profile Switch
/*** Freelancer -> Client ***/
router.get('/switch/client/:user_email', ensureAuthentication, async function (req, res, next) {
    let userUUID = req.params.user_email;

    UserModel.findOne({email:emailDecode(userUUID)})
        .then( user => {
            user.user_stature.current = 'client';

            user.save(err => {
                if(err){
                    throw err;
                }

                let previousURL = req.get('referer');

                req.flash('success_message', 'Switch to client was successful' );

                if(!previousURL.includes('receiverKey')){

                    if(previousURL === `${domainName}/`)
                        res.redirect(`back`);
                    else
                        res.redirect(`/account/client/${userUUID}`);

                }
                else
                    res.redirect(`/account/client/${userUUID}`);
            })
        })
        .catch( error => {
            return next(error)
        })
})

/*** Client -> Freelancer ***/
router.get('/switch/freelancer/:user_email', ensureAuthentication, async function (req, res, next) {
    let userUUID = req.params.user_email;
    let flash_message;
    UserModel.findOne({email:emailDecode(userUUID)})
        .then( user => {

            if (user.user_stature.initial === 'client')
                flash_message = 'Request to become Freelancer was successful'
            else
                flash_message = 'Switch to Freelancer was successful'

            user.user_stature = {
                initial: 'freelancer',
                current: 'freelancer'
            };

            user.save(err => {
                if(err){
                    throw err;
                }

                let previousURL = req.get('referer');

                req.flash('success_message', flash_message);

                if(!previousURL.includes('receiverKey')){

                    if(previousURL === `${domainName}/`)
                        res.redirect(`back`);
                    else
                        res.redirect(`/account/freelancer/${userUUID}`);

                }
                else
                    res.redirect(`/account/freelancer/${userUUID}`);
            })

        })
        .catch( error => {
            return next(error)
        })
})


/*router.get('/adminstration/all-users/:uniqueKey', async function (req, res, next) {
    if(req.params.uniqueKey === 'wehg484NWJBN24@qewq--4gwnlgkWFINJ'){
        console.log('-------------- Freelancer -------------------')
        var allFreelancerUsers = await UserModel.find({
            $or: [
                {"serviceAndPrice.0": { $exists: true }},
                {user_stature: 'freelancer'}
            ]
        });
        allFreelancerUsers.forEach( singleUser => {
            singleUser.user_stature = {
                initial: 'freelancer',
                current: 'freelancer'
            }
            singleUser.save();
        });
        console.log('-------------- Client -------------------')
        var allClientUsers = await UserModel.find({
            $and: [
                {"serviceAndPrice.0": { $exists: false }},
                {user_stature: 'client'}
            ]
        });
        allClientUsers.forEach( singleUser => {
            singleUser.user_stature = {
                initial: 'client',
                current: 'client'
            }
            singleUser.save();
        });
        console.log('Data Successfully updated!')
        res.send('done')
    }
})*/

module.exports = router;