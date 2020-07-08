const getDB = require('../utils/database').getDB;

class Route {
    constructor(name, description, trips, created_at) {
        this.name = name;
        this.description = description;
        this.trips = trips;
        this.created_at = created_at;
    }

    save() {
        const db = getDB();
        return db.collection('routes').insertOne(this);
    }

    static get() {
        const db = getDB();
        return db.collection('routes').find().sort({ created_at:-1 }).toArray();
    }
}

module.exports = Route;