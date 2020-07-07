const getDB = require('../utils/database').getDB;

class User {
    constructor(name, email, password, admin, avatar, activation_token, created_at) {
        this.name = name;
        this.email = email;
        this.password = password,
        this.admin = admin;
        this.avatar = avatar;
        this.activation_token = activation_token;
        this.created_at = created_at;
    }

    save() {
        const db = getDB();

        return db.collection('users').insertOne(this);
    }
}

module.exports = User;