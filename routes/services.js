var express = require('express');
const UserModel = require("../models/UserModel");
var router = express.Router();
var {emailEncode, emailDecode} = require('../bin/encodeDecode');
const {imageToDisplay} = require("../bin/imageBuffer");

/* GET home page. */
function searchQuerySimilarWords(searchWord) {
    let listOfWords;
    if(searchWord === 'graphics_design'){
        listOfWords = ['graphics', 'art', 'animation', 'graphic', 'designer', 'animations', 'arts',
            'editor', 'editors', 'animator', 'digital', 'frame', 'digitals', 'animators', 'frames', 'creative',
            'graphical']
    }
    if(searchWord === 'social_media_specialist'){
        listOfWords = ['facebook', 'twitter', 'linkedin', 'instagram', 'social', 'socials', 'media',
        'blog', 'blogger', 'tiktok', 'vlogger', 'vlog', 'creative', 'public', 'relation', 'relations', 'pr']
    }
    if(searchWord === 'photography'){
        listOfWords = ['photo', 'photos', 'photographer', 'photographers', 'photography', 'graphics',
            'photographic', 'photographics', 'portrait', 'camera', 'video', 'recorder', 'recording',
            'Videographer', 'Videography', 'graphic', 'film', 'films', 'graphical']
    }
    if(searchWord === 'teacher'){
        listOfWords = ['teacher', 'assistant', 'lecturer', 'instructor', 'professor', 'academic',
        'academics', 'academy', 'learner', 'coordinator', 'trainer', 'reader', 'writer', 'coach',
        'schoolteacher', 'pedagogue', 'educator', 'mentor', 'tutor', 'master', 'translator']
    }
    if(searchWord === 'software_development'){
        listOfWords = ['software', 'development', 'developer', 'web', 'website', 'engineer', 'engineering',
        'programmer', 'devops', 'cloud', 'clouds', 'aws', 'amazon web services', 'app', 'coder', 'python',
        'javascript', 'java', 'golang', 'gcp', 'google', 'architect', 'shopify']
    }
    if(searchWord === 'ux_ui_design'){
        listOfWords = ['ux', 'ui', 'design', 'user', 'interface', 'experience', 'custom', 'graphical']
    }
    if(searchWord === 'marketing'){
        listOfWords = ['marketing', 'advert', 'advertisement', 'promotion', 'specialist', 'promoter',
        'social', 'media', 'brand', 'manager', 'management', 'product', 'event', 'network', 'networking',
        'public', 'relation', 'pr', 'music', 'concert', 'videos', 'images', 'musics', 'video', 'image',
        'seo', 'sem', 'commerce', 'digital', 'content', 'search', 'engine', 'growth']
    }
    if(searchWord === 'business_analysis'){
        listOfWords = ['business', 'analysis', 'analyst', 'manager', 'owner', 'finance', 'trader', 'trade',
        'trading', 'financial', 'finances', 'dealer', 'broker', 'money', 'funds', 'bank', 'banker', 'management',
        'corporate', 'advisor', 'fund', 'stake', 'bankroll', 'financials']
    }


    return listOfWords.map(eachWord => new RegExp(`.*${eachWord}.*`, 'i'));
}


router.get('/', async function (req, res, next) {
    console.log('Inside the service router')
    try {
        let isLogged = req.isAuthenticated();
        let loggedInUser = req.user;

        let searchQuery = req.query.search_query;
        let trial_days = 30;

        let findFreelancersQuery = [
            {
                'user_stature.initial': 'freelancer'
            },
            {
                "serviceAndPrice.0": { $exists: true }
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

        if(searchQuery){
            let searchWords = searchQuerySimilarWords(searchQuery);
            findFreelancersQuery.push({
                "serviceAndPrice.service": { $in : searchWords}
            })
        }

        if (isLogged) {
            findFreelancersQuery.push(
                {
                    email: { $ne: loggedInUser.email }
                }
            )
        }

        let allFreelancers = await UserModel.find({
            $and: findFreelancersQuery
        });

        res.render('services', {
            isLogged,
            loggedInUser,
            allFreelancers,
            emailEncode
        });
    } catch (e) {
        next(e);
    }

});

module.exports = router;
