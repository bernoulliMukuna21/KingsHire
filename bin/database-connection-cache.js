require('dotenv').config({path: `${__dirname.slice(0, -3)}.env`});
var EF_DB_conn = {};

/*
* The following codes are for setting up the connection
* to MongoDB (cloud and local)
* */
var mongoose = require('mongoose');

let connection_URI = process.env.REMOTE_MONGO_URI;// Remote mongoDB connection
/* Local mongoDB connection*/

//let database_name = '/excellence_freelance';
//let connection_URI = process.env.local_connectionURI+database_name;

try{
    EF_DB_conn.kingsHireDB = mongoose.createConnection(connection_URI);
    console.log('Mongo Connection Established!');

}catch (err) {
    //if there is any problem

    console.log(err);
    process.exit(1);
}

module.exports = {
    EF_DB_conn
};