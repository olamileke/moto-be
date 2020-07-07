const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dbConnectionString = require('./config').databaseConnectionString;
let _db;

exports.connectToDB = callback => {
    mongoClient.connect(dbConnectionString)
    .then(client => {
        _db = client.db();
        callback();
    })
    .catch(err => {
        throw err;
    })
}

exports.getDB = () => {
    if(!_db) {
        throw err;
        return;
    }

    return _db;
}