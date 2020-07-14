const Route = require('./route');

const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class Vehicle
{
    constructor(model, plate_number, picture, trips, pending, reserved_till, created_at) {
        this.model = model;
        this.plate_number = plate_number;
        this.picture = picture;
        this.trips = trips;
        this.pending = pending;
        this.reserved_till = reserved_till;
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();
        return db.collection('vehicles').insertOne(this);
    }

    static count(admin)
    {
        const db = getDB();
        if(admin) {
            return db.collection('vehicles').find().count();
        }

        return db.collection('vehicles').find({ $and:[{ pending:false }, { reserved_till:{ $lt:Date.now() } }] }).count();
    }

    static update(id, model, plate_number, picture=null) 
    {
        const db = getDB();
        if(!picture) {
            return db.collection('vehicles').updateOne({ _id:new ObjectID(id) }, { $set:{ model:model, plate_number:plate_number } })
            .then(() => {
                return Vehicle.findByID(id)
            })
        }
        return db.collection('vehicles').updateOne({ _id:new ObjectID(id) }, { $set:{ model:model, plate_number:plate_number, picture:picture } })
        .then(() => {
            return Vehicle.findByID(id)
        })
    } 

    static findByID(id)
    {
        const db = getDB();
        return db.collection('vehicles').findOne({ _id:new ObjectID(id) });
    }

    static findByPlateNumber(plate_number)
    {
        const db = getDB();
        return db.collection('vehicles').findOne({ plate_number:plate_number })
    }

    static requestUpdate(id, pending, dateStamp=null, trips=null)
    {
        const db = getDB();
        let updatedVehicle;
        if(!dateStamp && !trips) {
            return db.collection('vehicles').updateOne({ _id:new ObjectID(id) }, { $set:{ pending:pending } });
        }

        return Vehicle.findByID(id)
        .then(vehicle => {
            updatedVehicle = vehicle;
        })
        .then(() => {
            return db.collection('vehicles').updateOne({ _id:new ObjectID(id) },
            { $set:{ pending:pending, reserved_till:dateStamp, trips:updatedVehicle.trips + 1 } });
        })
    }

    static updateTrips(id, pending)
    {
        return Vehicle.setPending(id, pending)
        .then(({ op }) => { 
            const trips = op.trips + 1;
            return db.collection('vehicles').updateOne({ _id:new ObjectID(id) }, { $set:{ trips:trips } });
        })
    }

    static get(admin, skip, limit)
    {
        const db = getDB();

        if(admin) {
            return db.collection('vehicles').find().sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
        }

        return db.collection('vehicles').find({ $and:[{ pending:false }, { reserved_till:{ $lt:Date.now() } }] })
        .sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
    }
}

module.exports = Vehicle;