const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class Route
{
    constructor(from, to, description, trips, distance, active, created_at) {
        this.from = from;
        this.to = to
        this.description = description;
        this.trips = trips;
        this.distance = distance;
        this.active = active;
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();
        return db.collection('routes').insertOne(this);
    }

    static update(id, from, to, distance, description)
    {
        const db = getDB();
        return db.collection('routes').updateOne({ _id:new ObjectID(id) }, { $set:{ from:from, to:to, distance:distance, description:description} })
        .then(() => {
            return Route.findByID(id);
        })
    }

    static setActiveState(id, active)
    {
        const db = getDB();
        return db.collection('routes').updateOne({ _id:new ObjectID(id) }, { $set:{ active:active } });
    }

    static findByID(id)
    {
        const db = getDB();
        return db.collection('routes').findOne({ _id:new ObjectID(id) });
    }

    static findByName(from, to)
    {
        const db = getDB();
        return db.collection('routes').findOne({ $and:[{ from:from, to:to }] });
    }

    static all(admin)
    {
        const db = getDB();
        if(admin) {
            return db.collection('routes').find().sort({ created_at:-1 }).toArray();
        }
        return db.collection('routes').find({ active:true }).sort({ created_at:-1 }).toArray();
    }

    static count(admin) 
    {
        const db = getDB();
        if(admin) {
            return db.collection('routes').find().count();
        }
        return db.collection('routes').find({ active:true }).count();
    }

    static delete(id)
    {
        const db = getDB();
        return db.collection('routes').deleteOne({ _id:new ObjectID(id) });
    }

    static get(admin, skip, limit)
    {
        const db = getDB();
        if(admin) {
            return db.collection('routes').find().sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
        }
        return db.collection('routes').find({ active:true }).sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
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