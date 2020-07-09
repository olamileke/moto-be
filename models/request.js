const { ObjectID } = require('mongodb');

const getDB = require('../utils/database').getDB;

class Request {
    
    constructor(user, vehicle, route, approved, pending , expires_at, created_at) {
        this.user = user;
        this.vehicle = vehicle;
        this.route = route;
        this.approved = approved;
        this.pending = pending;
        this.expires_at = expires_at;
        this.created_at = created_at;
    }

    save() {
        const db = getDB();
        return db.collection('requests').insertOne(this);
    }

    static get(admin, userId) {
        const db = getDB();

        if(admin) {
            return db.collection('requests').find().sort({ created_at:-1 }).toArray();
        }

        return db.collection('requests').find({ 'user._id':new ObjectID(userId) }).sort({ created_at:-1 }).toArray();
    }
}

module.exports = Request;