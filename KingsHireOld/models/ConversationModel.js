var mongoose = require('mongoose');
var DB_connection = require('../bin/database-connection-cache');

let MessageSchema = new mongoose.Schema({
    sender:{
        type: String
    },
    message: {
        type: String
    },
    sendDay:{
        type: String
    },
    sendTime:{
        type: String
    },
    messageInsertionDate: {
        type: Date,
        default: Date.now()
    }
});

let ConversationSchema = new mongoose.Schema({
    roomID: {
        type: String
    },
    user1_id: {
        type: String
    },
    user2_id: {
        type: String
    },
    lastInsertionDate: {
        type: Date,
        default: Date.now()
    },
    roomIsClicked: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
});

let MessageModel = DB_connection.EF_DB_conn.kingsHireDB.model('MessageModel', MessageSchema);
let ConversationModel = DB_connection.EF_DB_conn.kingsHireDB.model('ConversationModel', ConversationSchema);
module.exports = {ConversationModel, MessageModel};
