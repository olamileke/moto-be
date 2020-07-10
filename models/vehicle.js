const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class Vehicle
{
    constructor(model, plate_number, picture, reserved_till, created_at) {
        this.model = model;
        this.plate_number = plate_number;
        this.picture = picture;
        this.reserved_till = reserved_till;
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();
        return db.collection('vehicles').insertOne(this);
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

    static setPending(id, pending)
    {
        const db = getDB();
        return db.collection('vehicles').updateOne({ _id:new ObjectID(id) }, { $set:{ pending:pending } });
    }

    static setReservedTill(id, dateStamp)
    {
        const db = getDB();
        return db.collection('vehicles').updateOne({ _id:new ObjectID(id) }, { $set:{ reserved_till:dateStamp } });
    }

    static get(admin)
    {
        const db = getDB();

        if(admin) {
            return db.collection('vehicles').find().sort({ created_at:-1 }).toArray();
        }

        return db.collection('vehicles').find({ $and:[{ pending:false }, { reserved_till:{ $lt:Date.now() } }] }).sort({ created_at:-1 }).toArray();
    }
}

module.exports = Vehicle;