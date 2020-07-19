const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class PasswordReset {

    constructor(userId, name, token, expires_at, created_at) {
        this.userId = userId;
        this.name = name;
        this.token = token;
        this.expires_at = expires_at;
        this.created_at = created_at;     
    }

    save() {
        const db = getDB();
        return db.collection('password_resets').insertOne(this);
    }

    static findByToken(token) {
        const db = getDB();
        return db.collection('password_resets').findOne({ token:token });
    }

    static delete(id) {
        const db = getDB();
        return db.collection('password_resets').deleteOne({ _id:new ObjectID(id) });
    }
}

module.exports = PasswordReset;