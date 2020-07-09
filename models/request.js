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
}

module.exports = Request;