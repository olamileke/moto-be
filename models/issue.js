const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class Issue {

    constructor(title, description, user, vehicle, picture, fixed_at, created_at) {
        this.title = title;
        this.description = description;
        this.user = user;
        this.vehicle = vehicle;
        this.picture = picture;
        this.fixed_at = fixed_at;
        this.created_at = created_at;
    }

    save() {
        const db = getDB();
        return db.collection('issues').insertOne(this);
    }

    static findByID(id) {
        const db = getDB();
        return db.collection('issues').findOne({ _id:new ObjectID(id) })
    }

    static markFixed(id) {
        const db = getDB();
        return db.collection('issues').updateOne({ _id:new ObjectID(id) }, { $set:{ fixed_at:Date.now() } })
    }

    static count(admin, userId) {
        const db = getDB();
        if(admin) {
            return db.collection('issues').find().count();
        }

        return db.collection('issues').find({ 'user._id':new ObjectID(userId) }).count();
    }

    static get(admin, userId, skip, limit) {
        const db = getDB();
        if(admin) {
            return db.collection('issues').find().sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
        }

        return db.collection('issues').find({ 'user._id':new ObjectID(userId) }).sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
    }
}

module.exports = Issue;