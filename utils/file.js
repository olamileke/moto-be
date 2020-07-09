const fs = require('fs');

exports.delete = (path) => {
    fs.unlink(path, err => {
        console.log(err);
    })
}