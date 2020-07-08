const getDB = require('../utils/database').getDB;

class Vehicle {

    constructor(model, plate_number, picture, reserved_till, created_at) {
        this.model = model;
        this.plate_number = plate_number;
        this.picture = picture;
        this.reserved_till = reserved_till;
        this.created_at = created_at;
    }

    save() {
        const db = getDB();
        return db.collection('vehicles').insertOne(this);
    }

    static get(admin) {
        const db = getDB();

        if(admin) {
             return db.collection('vehicles').find().sort({ created_at:-1 }).toArray();
        }
    }
}

module.exports = Vehicle;