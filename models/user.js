const getDB = require('../utils/database').getDB;
const ObjectID = require('mongodb').ObjectID;

class User
{
    constructor(name, email, password, admin, avatar, activation_token, busy_till, created_at) {
        this.name = name;
        this.email = email;
        this.password = password,
        this.admin = admin;
        this.avatar = avatar;
        this.activation_token = activation_token;
        this.busy_till = null;
        this.created_at = created_at;
    }

    save()
    {
        const db = getDB();

        return db.collection('users').insertOne(this);
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

    static changeAvatar(id, path)
    {
        const db = getDB();
        return db.collection('users').updateOne({ _id:new ObjectID(id) }, { $set:{ avatar:path } })
    }

    static get()
    {
        const db = getDB();
        return db.collection('users').find({ admin:false }).sort({ created_at:-1 }).toArray()
    }

    static setBusyTime(id, dateStamp)
    {
        const db = getDB();
        return db.collection('users').updateOne({ _id:new ObjectID(id) }, { $set:{ busy_till:dateStamp } })
    }
}

module.exports = User;