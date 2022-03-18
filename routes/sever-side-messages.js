var express = require('express');
var router = express.Router();
var Messages_MDB = require('../models/ConversationModel');
var UserModel = require('../models/UserModel');
var { ensureAuthentication } = require('../bin/authentication');
var { emailDecode } = require('../bin/encodeDecode');
var { imageToDisplay } = require('../bin/imageBuffer');


async function getUserProfile(userUniqueKey) {
    try{
        let userProfile = await UserModel.findOne({email: emailDecode(userUniqueKey)});
        if(userProfile){
            let userImageSrc = imageToDisplay(userProfile);

            let userProfileData =
                {
                    userData: {name: userProfile.name, surname: userProfile.surname, uniqueKey: userUniqueKey},
                    userImageSrc: userImageSrc
                }

            return userProfileData;
        }
    }catch (error) {
        throw error
    }
}

function server_io(io) {
    let sender, receiver, message, day, time;

    io.on('connection', socket=>{
        socket.on('join', userData => {
            // User join room
            console.log('Socket io - KingsHire connected')
            socket.join(userData.uniqueKey);
        });

        socket.on('MessageInput', inputData => {
            let roomDB, potential_dbRoom1, potential_dbRoom2;

            sender = inputData.sender;
            receiver = inputData.receiver;
            message = inputData.message;
            day = inputData.day;
            time = inputData.time;

            if(message !=='' && day !=='' && time !==''){
                potential_dbRoom1 = 'room:'+sender+':'+receiver;
                potential_dbRoom2 = 'room:'+receiver+':'+sender;

                Messages_MDB.ConversationModel.findOne({
                    $or: [{
                        roomID: potential_dbRoom1
                    }, {
                        roomID: potential_dbRoom2
                    }]
                }).then(roomData => {

                    /***** First: Identify the correct to save chat *****/

                    if(roomData){
                        // Users have already spoken before.
                        // So, use the current room to save chat

                        roomDB = roomData.roomID;
                    }else{
                        // user have never spoken before.
                        // create room to save chat

                        roomDB = potential_dbRoom1;
                        roomData = new Messages_MDB.ConversationModel({
                            roomID: roomDB,
                            user1_id: sender,
                            user2_id: receiver
                        });
                    }

                    /***** Second: Proceed to saving chat in the correct room *****/

                    let insertionDate = Date.now();
                    let newMessage = new Messages_MDB.MessageModel({
                        sender: sender, message: message, sendDay: day, sendTime: time,
                        messageInsertionDate: insertionDate
                    });

                    roomData.roomIsClicked = false;
                    roomData.lastInsertionDate = insertionDate;
                    roomData.messages.push(newMessage);

                    roomData.save(err => {
                        if(err){
                            throw err;
                        }
                        console.log('Message Sent to DB - success');
                    })

                    /***** Third: Send data to both sender and receiver - client side *****/

                    socket.emit('Send Message', {message, day, time, receiver});
                    socket.broadcast.to(receiver).emit('Receive Message', {message, day, time, sender});

                }).catch(error => {
                    console.log('Message An error occurred!');
                });
            }
        })
    })
    
    router.get('/get-profile/:senderID', ensureAuthentication, async (req, res, next) => {
        let sender = req.params.senderID;

        try {
            let userProfileData = await getUserProfile(sender);

            if(userProfileData)
                res.json(userProfileData)

        } catch (error) {
            next(error);
            return;
        }

    })

    router.get('/get-messages-rooms/:loggedInUserUniqueKey', ensureAuthentication, (req, res, next) => {
        let loggedInUserUniqueKey = req.params.loggedInUserUniqueKey;
        let loggedInUser = req.user;
        let allRoomsDetails = [];

        let requirement = req.query.requirement;

        Messages_MDB.ConversationModel.find({
            $or: [{
                user1_id: loggedInUserUniqueKey
            }, {
                user2_id: loggedInUserUniqueKey
            }]
        }).sort( { lastInsertionDate: 1 } ).then(async allConversationRooms => {
            if(requirement === 'update'){
                let roomToUpdateIndex = req.query.roomIndex;
                let roomToUpdate = allConversationRooms.reverse()[roomToUpdateIndex];
                roomToUpdate.roomIsClicked = true;

                roomToUpdate.save(err => {
                    if(err){
                        throw err;
                    }
                    res.json('Room Updated');
                })
            }else if(requirement === 'getRooms'){
                if(allConversationRooms){
                    for (const forEachConversatioRoom of allConversationRooms) {
                        let receiver = loggedInUserUniqueKey === forEachConversatioRoom.user1_id
                            ? forEachConversatioRoom.user2_id : forEachConversatioRoom.user1_id;

                        let currentReceiverData = await getUserProfile(receiver);
                        if(currentReceiverData){
                            currentReceiverData.userData.roomIsClicked = forEachConversatioRoom.roomIsClicked;
                            currentReceiverData.userData.lastMessageSender = forEachConversatioRoom.messages.slice(-1)[0].sender;
                            allRoomsDetails.push(currentReceiverData);
                        }
                    }

                    res.json(allRoomsDetails);
                }
            }
            else res.json(undefined);

        }).catch( error => {console.log(error); return next(error)});

    });

    router.get('/get-user-messages/:loggedInUserUniqueKey/:receiverUserUniqueKey', ensureAuthentication, (req, res, next) => {
        console.log('Get all room messages');
        let loggedInUserKey = req.params.loggedInUserUniqueKey;
        let receivingUserKey = req.params.receiverUserUniqueKey;

        Messages_MDB.ConversationModel.aggregate(
            [
                {$unwind: "$messages"},
                {$match:
                        {
                            $or: [
                                {$and: [{user1_id: loggedInUserKey}, {user2_id: receivingUserKey}]},
                                {$and: [{user1_id: receivingUserKey}, {user2_id: loggedInUserKey}]}
                            ]
                        }
                },{$sort:{'messages.messageInsertionDate': 1 }}
            ]
        ).then(allMessages => {
            res.json(allMessages);
        }).catch( error => {
            return next(error)
        } );

    })

    return router;
}

module.exports = {
    router, server_io, getUserProfile
}
