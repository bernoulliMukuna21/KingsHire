var mongoose = require('mongoose');
var DB_connection = require('../bin/database-connection-cache');

let BookingSchema = new mongoose.Schema({
    bookingID: String,
    bookingType: {
      type: String
    },
    customer: {
        uuid: String,
        name: String
    },
    supplier: {
        uuid: String,
        name: String
    },
    service: {
        type: String
    },
    projectName: {
        type: String
    },
    projectDescription: {
        type: String
    },
    creationDate: {
        type: Date,
    },
    dueDateTime: {
        type: Date
    },
    price: {
        type: String
    },
    requestedPrice: {
        type: String
    },
    status: {
        freelancer: Number,
        client: Number
    },
    completionDate: {
        type: Date
    },
    deletionReason: {
        type: String
    },
    paid: {
        type: Boolean,
        default: false
    },
    bookingModificationConversation: [{
        responseDay:{
            type: Date,
            default: Date.now()
        },
        newProposedDescription: {
            type: String
        },
        newProposedPrice:{
            type: String
        },
        newProposedDueDate:{
            type: Date
        }
    }]
});


let BookingModel = DB_connection.EF_DB_conn.kingsHireDB.model('BookingModel', BookingSchema);
module.exports = BookingModel;
