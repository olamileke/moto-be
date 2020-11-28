const config = require('./config');
const AWS = require('aws-sdk');

const s3bucket = new AWS.S3({
    accessKeyId:config.aws_access_key_id,
    secretAccessKey:config.aws_secret_key,
    region:config.aws_region
})

exports.upload = async function upload(req, res, next, folder, cb) {
    const file = req.file;
    const s3FileUrl = config.s3_file_link;
    const fileName = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;

    const fileParams = {
        Bucket:config.aws_bucket_name,
        Key:folder + '/' + fileName,
        Body:file.buffer,
        ContentType:file.mimetype,
        ACL:"public-read"
    };

    s3bucket.upload(fileParams, function(err, data) {
        if(err) {
            if(!err.statusCode) {
                err.statusCode = 500;
                console.log(err);
            }
            next(err);
            return;
        }

        const imageUrl = s3FileUrl + folder + '/' + fileName;
        return cb(imageUrl);
    })
}

exports.delete = async function deleteImage(filePath, next) {
    const fileParams = {
        Bucket:config.aws_bucket_name,
        Key:filePath.split(config.s3_file_link)[1]
    }

    s3bucket.deleteObject(fileParams, (err, data) => {
        if(err) {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        }
    })
}