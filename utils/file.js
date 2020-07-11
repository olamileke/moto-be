const fs = require('fs');
const path = require('path');
const config = require('./config');

exports.delete = (url) => {
    const relativeName = url.split(config.app_url)[1];
    const [ dir, folderPath ] = relativeName.split('images/');
    const [ folder, name ] = folderPath.split('/')
    const pathToFile = path.join(config.app_root, 'images', folder, name);

    fs.unlink(pathToFile, err => {
        console.log(err);
    })
}