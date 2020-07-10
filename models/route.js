const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class Route
{
    constructor(name, description, trips, created_at) {
        this.name = name;
        this.description = description;
        this.trips = trips;
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();
        return db.collection('routes').insertOne(this);
    }

    static update(id, name, description)
    {
        const db = getDB();
        return db.collection('routes').updateOne({ _id:new ObjectID(id) }, { $set:{ name:name, description:description} })
        .then(() => {
            return Route.findByID(id);
        })
    }

    static findByID(id)
    {
        const db = getDB();
        return db.collection('routes').findOne({ _id:new ObjectID(id) });
    }

    static findByName(name)
    {
        const db = getDB();
        return db.collection('routes').findOne({ name:name });
    }

    static get()
    {
        const db = getDB();
        return db.collection('routes').find().sort({ created_at:-1 }).toArray();
    }

    static updateTrips(id)
    {
        const db = getDB();
        return Route.findByID(id)
        .then(route => {
            const trips = route.trips + 1;
            return db.collection('routes').updateOne({ _id:new ObjectID(id) }, { $set:{ trips:trips } });
        })
        
    }
}

module.exports = Route;