import * as accountsOperation from './account_operate.js';
import * as socketConnection from './socketio-connection-client-side.js'

var socket = socketConnection.socket;
let receiver, pageToGo, pagesNames, pagesSections;

// Get sender identifier
let loggedInUser = JSON.parse($('#sender-unique-key').val());
socket.emit('join', loggedInUser);
var windowsize = $(window).width();

/********************* First: find Receiver and right room of conversation ***********************/
// Conversation initializer by clicking 'Message' button
$('.freelance-mssg-btn').click(function (event) {
    let freelancerToMessage_uniqueKey = event.target.childNodes[2].value;

    window.location.href = '/account/'+loggedInUser.type+'/'+
        loggedInUser.uniqueKey+'?receiverKey='+freelancerToMessage_uniqueKey;
});

/*** Get all the rooms ***/
function mobileVersionFunctionality(windowsize, sideToShow){

    if (windowsize <= 500){
        $('.user-messages-main-container-box').hide();
        $('.user-messages-side').hide();
        if(sideToShow === 'showContainerAndMessages'){
            $('.user-messages-main-container-box').show();
        }else if(sideToShow === 'showRooms'){
            $('.user-messages-side').show();
        }
    }
}

/*
$(window).resize(function() {
    windowsize = $(window).width();
    mobileVersionFunctionality(windowsize);
});
*/

$( document ).ready(function() {

    let currentURL = window.location.href;
    let previousURL = document.referrer;
    let loggedInUserURL = '/account/'+loggedInUser.type+'/'+
        loggedInUser.uniqueKey;

    if(currentURL.includes(loggedInUserURL)){

        if(previousURL === '' && currentURL.includes('?receiverKey=')){
            window.location.href = loggedInUserURL;
        }

        $('.user-messages-side').show();
        $('.all-different-conversations-container').empty();

        windowsize = $(window).width();
        mobileVersionFunctionality(windowsize, 'showRooms');

        roomsFromDB('getRooms').then( status => {
            console.log('Get rooms status: ', status);

            receiver = $('#clicked-receiver-key')[0];
            if(receiver){
                receiver = receiver.value;
                initializeMessageRoom(receiver);
            }

        }).catch( error => {
            console.log('Get rooms failed');
        });
    }
});

$(document).on('click', '.client-profile-information ul li:nth-child(3)', function(event) {
    windowsize = $(window).width();
    mobileVersionFunctionality(windowsize, 'showRooms');
})
$(document).on('click', '.user-completed-booking-page', function(event) {
    windowsize = $(window).width();
    mobileVersionFunctionality(windowsize, 'showRooms');
})

/*** Booking Initialiser button is clicked ***/
$(document).on('click', '#booking-side-message-bttn', function(event) {
    let freelancerToMessage_uniqueKey = $("#freelancerToMessageUUID").val();
    $.ajax({
        method: 'GET',
        url: `/messages/get-profile/${freelancerToMessage_uniqueKey}`,
        data: {},
        success: function (data) {
            windowsize = $(window).width();
            $('.user-messages-side').empty();
            $('.all-different-conversations-container').empty();
            let sourceImage = !data.userImageSrc ? '/images/userDefaultImage.png'
                :data.userImageSrc;
            receiver = data.userData;
            receiver = receiver.uniqueKey;

            roomsFromDB('getRooms').then( status => {
                console.log('Get rooms status: ', status);

                initializeMessageRoom(receiver);

            }).catch( error => {
                console.log('Get rooms failed');
            });

            $('.client-profile-information ul li:last-child').trigger('click');
            mobileVersionFunctionality(windowsize, 'showRooms');
        },
        error: function (error) {
            console.log('Error occurred in Initialising Message');
        }
    })
})

/*** Get the conversations of a room ***/
// Ongoing conversation and restarted by opening the chat room
$(document).on('click', '.message-single-room', function(currentRoom) {
    windowsize = $(window).width();
    let freelancerToMessage = this.childNodes[1].childNodes[0].childNodes[1].value;
    receiver = JSON.parse(freelancerToMessage);
    receiver = receiver.uniqueKey;

    let roomIndex = Array.from(this.parentNode.children).indexOf(this)

    history.pushState(null, null, '/account/'+loggedInUser.type+'/'+
        loggedInUser.uniqueKey+'?receiverKey='+receiver);

    $('.default-message-content').hide();
    $('.user-messages-side')[0]
        .childNodes.forEach(eachRoom => {
        $(eachRoom).removeClass("roomClicked");
    })

    if($(this)[0].className.includes("messageReceived")){
        $( this ).removeClass( "messageReceived" )

        roomsFromDB('update', roomIndex).then( status => {
            console.log('Update room: ', status);
        }).catch( error => {
            console.log('Update room failed');
        });
    }

    accountsOperation.roomConversationsNavigation(this,
        '.all-different-conversations-container',
        loggedInUser.uniqueKey, receiver);
    $('.user-messages-main-container-box').show();
    mobileVersionFunctionality(windowsize, 'showContainerAndMessages');
})
/********************* Second: Sending Messages ***********************/

let messageData = {}

function messageController(receiverKey, messageToSend) {
    /*
    * This function deals with the construction of the necessary information
    * for sending message from one user to another.
    * */
    messageData.sender = loggedInUser.uniqueKey;
    messageData.receiver = receiverKey;

    //Get message to send
    let message = messageToSend;
    let messageSendTime = new Date();

    if(message.length>=1){
        messageData.message = message;
        messageData.day = messageSendTime.toLocaleDateString('en-GB', {
            month: '2-digit',day: '2-digit',year: 'numeric'});
        messageData.time = moment(messageSendTime.toLocaleTimeString(), ["h:mm A"]).format("HH:mm");
        socket.emit('MessageInput', messageData);
    }
}

$(document).on('keypress', '.chat-typing-area', function(event) {
    if(event.keyCode=== 13 && event.shiftKey == false){
        event.preventDefault();

        let message = event.target.value;
        messageController(receiver, message.trim());

        // Clear send form box
        $(".chat-typing-area").val('');
    }
})

$(document).on('click', '.message-container-typeBox i', function(event) {
    event.preventDefault();

    let message = event.target.parentNode.childNodes[0].value;
    messageController(receiver, message.trim());

    // Clear send form box
    $(".chat-typing-area").val('');

    // Start typing again
    $(".chat-typing-area").focus();
})

socket.on('Send Message', outputData => {
    // Send received

    let messageReceiver = outputData.receiver;
    let allRooms_senderSide = $('.user-messages-side')[0].childNodes;
    let allConversationRooms_senderSide = $('.user-messages-main-container-box')[0]
        .childNodes[1].childNodes;

    allConversationRooms_senderSide.forEach((eachRoom, index) => {
        if(eachRoom.classList[1] === messageReceiver
            && allRooms_senderSide[index].classList[1] === messageReceiver){
            accountsOperation.createMessageHTML(outputData,
                'user-single-send-message', eachRoom.childNodes[1]);
            $(eachRoom.childNodes[1]).animate({
                    scrollTop: $(eachRoom.childNodes[1])[0].scrollHeight},
                1000);
            $(allRooms_senderSide[index]).parent().prepend(allRooms_senderSide[index]);
            $(eachRoom).parent().prepend(eachRoom);
            $(eachRoom)[0].childNodes[2].childNodes[0].focus();
        }
    })
})

socket.on('Receive Message', outputData => {
    // Message received

    let messageSender = outputData.sender;
    let allRooms_receiverSide = $('.user-messages-side')[0].childNodes;
    let roomReceived;
    let allConversationRooms_receiverSide = $('.user-messages-main-container-box')[0]
        .childNodes[1].childNodes;
    $.ajax({
        type: 'GET',
        url: '/messages/get-profile/'+messageSender,
        success: function (data) {
            let sourceImage = !data.userImageSrc ? '/images/userDefaultImage.png'
                :data.userImageSrc;
            let senderData = data.userData;
            if(allConversationRooms_receiverSide.length === 0){
                // The receiver does not have any chat yet. So, create one
                accountsOperation.createNewRoom(senderData, sourceImage); // Create a new room
                accountsOperation.createNewConversationContainer(senderData, sourceImage); // Create New Conversation holder
                accountsOperation.createMessageHTML(outputData,
                    'user-single-receive-message', allConversationRooms_receiverSide[0].childNodes[1]);
                $(".message-container-main").animate({
                        scrollTop: $(".message-container-main")[0].scrollHeight},
                    1000);
                roomReceived = 0;
            }else{
                // The receiver has other chats, so find the correct one. There are two scenarios:
                let conversationRoomExists = false;
                let conversationRoom;
                for (var i = 0; i < allConversationRooms_receiverSide.length; ++i) {
                    if(allConversationRooms_receiverSide[i].classList[1] === messageSender){
                        conversationRoomExists = true;
                        conversationRoom = allConversationRooms_receiverSide[i];
                        roomReceived = i;
                        break;
                    }
                }
                // Users never spoken to this particular sender. So create room
                if(!conversationRoomExists){
                    accountsOperation.createNewRoom(senderData, sourceImage); // Create a new room
                    accountsOperation.createNewConversationContainer(senderData, sourceImage); // Create New Conversation holder
                    conversationRoom = $('.user-messages-main-container-box')[0]
                        .childNodes[1].childNodes[0];
                    roomReceived = 0;
                }
                // Show message
                accountsOperation.createMessageHTML(outputData,
                    'user-single-receive-message', conversationRoom.childNodes[1]);
                $(conversationRoom.childNodes[1]).animate({
                        scrollTop: $(conversationRoom.childNodes[1])[0].scrollHeight},
                    1000);
            }
            $('.newMessageReceived').show();
            $(allRooms_receiverSide[roomReceived])[0].classList.add('messageReceived');
            $(allRooms_receiverSide[roomReceived]).parent().prepend(allRooms_receiverSide[roomReceived]);
            $(allConversationRooms_receiverSide[roomReceived]).parent().prepend(allConversationRooms_receiverSide[roomReceived]);
        },
        error: function (error) {
            console.log('Message not received - error: ', error)
        }
    })
})

/********************* Third: Retrieving Rooms from DB ***********************/

function roomsFromDB(requirement, roomIndex){

    console.log('Ajax Call - get the rooms');
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/messages/get-messages-rooms/'+loggedInUser.uniqueKey+'?requirement='+requirement+'&roomIndex='+roomIndex,
            success: function (data) {
                console.log('Successful Ajax Call');
                let numberOfRooms = data.length;

                if(requirement === 'getRooms'){
                    if(numberOfRooms > 0){
                        data.forEach((eachData, index) => {

                            let sourceImage = !eachData.userImageSrc ? '/images/userDefaultImage.png'
                                :eachData.userImageSrc;
                            let userData = eachData.userData;

                            if(!userData.roomIsClicked && userData.lastMessageSender !== loggedInUser.uniqueKey){
                                userData.messageReceivedClassName = 'messageReceived';
                                $('.newMessageReceived').show();
                            }

                            // Create rooms and conversation boxes
                            accountsOperation.createNewRoom(userData, sourceImage);
                            accountsOperation.createNewConversationContainer(userData, sourceImage); // Create New Conversation holder
                        })
                    }
                }else if(requirement === 'update'){
                    console.log(data)
                }

                resolve('passed');
            },
            error: function (error) {
                reject(error);
            }
        })
    })
}

function initializeMessageRoom(receiverUniqueKey) {
    $.ajax({
        method: 'GET',
        url: `/messages/get-profile/${receiverUniqueKey}`,
        data: {},
        success: function (data) {
            let loggedInUserRooms = $('.user-messages-side')[0].childNodes;
            let numberOfRooms = loggedInUserRooms.length;

            let receiverData = data.userData;
            let sourceImage = data.userImageSrc;
            let roomIndex = 0;

            if(numberOfRooms === 0){
                // There no rooms yet
                accountsOperation.createNewRoom(receiverData, sourceImage); // Create a new room
                accountsOperation.createNewConversationContainer(receiverData, sourceImage); // Create New Conversation holder

            }else{
                // There are already some rooms going on. Now, we need to check if
                // the two current users already have a conversation going on
                loggedInUserRooms = $('.user-messages-side')[0].childNodes;
                let roomExists = false;
                let roomToShow;

                for (var i = 0; i < loggedInUserRooms.length; ++i) {
                    if(loggedInUserRooms[i].classList[1] === receiverData.uniqueKey){
                        roomExists = true;
                        roomIndex = i;
                        break;
                    }
                }

                if(!roomExists){
                    // Room does not exist. users have never spoken before
                    accountsOperation.createNewRoom(receiverData, sourceImage); // Create a new room
                    accountsOperation.createNewConversationContainer(receiverData, sourceImage); // Create New Conversation holder
                }
            }

            loggedInUserRooms = $('.user-messages-side')[0].childNodes;

            $('.default-message-content').hide();

            accountsOperation.roomConversationsNavigation(
                loggedInUserRooms[roomIndex],
                '.all-different-conversations-container',
                loggedInUser.uniqueKey, receiverData.uniqueKey);

            $(loggedInUserRooms[roomIndex]).trigger('click');
        },
        error: function (error) {
            console.log('Error occurred in Initialising Message');
        }
    })

}