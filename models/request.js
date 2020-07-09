const db = getDB();

class Request {
    
    constructor(user, vehicle, route, approved, expires_at, created_at) {
        this.user = user;
        this.vehicle = vehicle;
        this.route = route;
        this.approved = approved;
        this.expires_at = expires_at;
        this.created_at = created_at;
    }

    save() {
        const db = getDB();
        return db.collection('requests').insertOne(this);
    }
}