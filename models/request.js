const { ObjectID } = require('mongodb');

const getDB = require('../utils/database').getDB;

class Request
{
    constructor(user, vehicle, route, approved, pending , expires_at, created_at) {
        this.user = user;
        this.vehicle = vehicle;
        this.route = route;
        this.approved = approved;
        this.pending = pending;
        this.expires_at = expires_at;
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();
        return db.collection('requests').insertOne(this);
    }

    static findByID(id)
    {
        const db = getDB();
        return db.collection('requests').findOne({ _id:new ObjectID(id) });
    }

    static checkActiveDriver(userId)
    {
        const db = getDB();
        return db.collection('requests').find({ $and:[{ 'user._id':new ObjectID(userId) }, 
        { $or:[{ pending:true }, { expires_at:{ $gte:Date.now() } }] }] }).sort({ created_at:-1 }).limit(1).toArray();
    }

    static checkActiveRoute(routeId)
    {
        const db = getDB();
        return db.collection('requests').find({ $and:[{ 'route._id':new ObjectID(routeId) }, 
        { $or:[{ pending:true }, { expires_at:{ $gte:Date.now() } }] }] }).sort({ created_at:-1 }).limit(1).toArray();
    }

    static checkActiveVehicle(vehicleID)
    {
        const db = getDB();
        return db.collection('requests').find({ $and:[{ 'vehicle._id':new ObjectID(vehicleID) },
        { $or:[{ pending:false }, { expires_at:{ $gte:Date.now() } }] }] }).sort({ created_at:-1 }).limit(1).toArray();
    }

    static updateRoute(routeId, name)
    {
        const db = getDB();
        return db.collection('requests').updateMany({ 'route._id':new ObjectID(routeId) }, { $set:{ 'route.name':name } });
    }

    static updateUser(userId, avatar)
    {
        const db = getDB();
        return db.collection('requests').updateMany({ 'user._id':new ObjectID(userId) }, { $set:{ 'user.avatar':avatar } })
    }

    static updateVehicle(vehicle)
    {
        const db = getDB();
        return db.collection('requests').updateMany({ 'vehicle._id':new ObjectID(vehicle._id) }, { $set:{ vehicle:vehicle } }); 
    }

    static setApprovedState(id, approved)
    {
        const db = getDB();
        return db.collection('requests').updateOne({ _id:new ObjectID(id) }, { $set:{ approved:approved, pending:false } });
    }

    static count(admin, userId) 
    {
        const db = getDB();

        if(admin) {
            return db.collection('requests').find().count();
        }

        return db.collection('requests').find({ 'user._id':new ObjectID(userId) }).count();
    }

    static get(admin, userId, skip, limit)
    {
        const db = getDB();

        if(admin) {
            return db.collection('requests').find().sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
        }

        return db.collection('requests').find({ 'user._id':new ObjectID(userId) }).sort({ created_at:-1 }).skip(skip).limit(limit).toArray();
    }
}

module.exports = Request;