const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class User
{
    constructor(name, email, password, admin, avatar, activation_token, trips, busy_till, created_at) {
        this.name = name;
        this.email = email;
        this.password = password,
        this.admin = admin;
        this.avatar = avatar;
        this.activation_token = activation_token;
        if(!admin) {
            this.trips = trips;
            this.busy_till = busy_till;
        }
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();
        return db.collection('users').insertOne(this);
    }

    static count()
    {
        const db = getDB();
        return db.collection('users').find({ admin:false }).count();
    }

    static findByID(id)
    {
        const db = getDB();
        return db.collection('users').findOne({ _id:new ObjectID(id) })
    }

    static findByEmail(email)
    {
        const db = getDB();
        return db.collection('users').findOne({ email:email })
    }

    static findByActivationToken(token)
    {
        const db = getDB();
        return db.collection('users').findOne({ activation_token:token });
    }

    static activate(id)
    {
        const db = getDB();
        return db.collection('users').updateOne({ _id:new ObjectID(id) }, { $set:{ activation_token:null } });
    }

    static changeAvatar(id, path)
    {
        const db = getDB();
        return db.collection('users').updateOne({ _id:new ObjectID(id) }, { $set:{ avatar:path } })
    }

    static get(skip, limit)
    {
        const db = getDB();
        return db.collection('users').find({ admin:false }).sort({ created_at:-1 }).skip(skip).limit(limit).toArray()
    }

    static requestUpdate(id, dateStamp, trips)
    {
        const db = getDB();
        return db.collection('users').updateOne({ _id:new ObjectID(id) }, { $set:{ busy_till:dateStamp, trips:trips } })
    }
}

module.exports = User;