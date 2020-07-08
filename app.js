const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./utils/database');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');

app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
})
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(userRoutes);
app.use(authRoutes);
app.use(vehicleRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    const statusCode = err.statusCode || 500;
    const message = err.message;
    const errors = err.errors;

    if(errors) {
        res.status(statusCode).json({
            message:message,
            errors:errors
        })
    }
    else {
        res.status(statusCode).json({
            message:message
        })
    }
})

database.connectToDB(() => {
    app.listen(1000);
})
