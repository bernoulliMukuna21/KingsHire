var express = require('express');
const UserModel = require("../models/UserModel");
var router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
    console.log('Inside the service router')
    try {
        let searchQuery = req.query.search_query;
        searchQuery = 'Vocalist'
        console.log(searchQuery)
        let trial_days = 30;
        let findFreelancersQuery = [
            {
                'user_stature.initial': 'freelancer'
            },
            {
                "serviceAndPrice.0": { $exists: true }
            },
            {
                "serviceAndPrice.service": { "$regex": `/.*vocalist.*/i`}
            },
            {
                $or:[
                    {is_subscribed: true},
                    {
                        $and:[
                            {is_subscribed: false},
                            {
                                $expr:{
                                    $lte: [
                                        {
                                            $trunc: {
                                                $divide: [{"$subtract":["$$NOW","$date"]}, 1000 * 60 * 60 * 24]
                                            }
                                        },
                                        trial_days
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        let allFreelancers = await UserModel.find({
            "serviceAndPrice.service": { $regex : new RegExp('.*vocalist.*', 'i')}
        });

        console.log('All freelancers: ', allFreelancers);
        res.status(200).send('Done')
        //res.render('services');
    } catch (e) {
        console.log(e)
    }

});

module.exports = router;
