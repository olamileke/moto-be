const fs = require('fs');
const path = require('path');
const app_url = require('../utils/config').app_url;

exports.delete = (url) => {
    const relativeName = url.split(app_url)[1];
    const [ dir, folderPath ] = relativeName.split('images/');
    const [ folder, name ] = folderPath.split('/')
    const appDirectory = path.dirname(process.mainModule.filename);
    const pathToFile = path.join(appDirectory, 'images', folder, name);

    fs.unlink(pathToFile, err => {
        console.log(err);
    })
}