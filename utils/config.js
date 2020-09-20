const path = require('path');

exports.databaseConnectionString = ' '

exports.app_url = 'http://localhost:4000/';

exports.client_url = 'http://localhost:4200/'

exports.secret_key = 'mYYP2dJBNeyclufoYuEJkjhnkljkjsdfhkjdlfk';

exports.app_root = path.dirname(process.mainModule.filename);

exports.per_page = 9;

exports.mailgun_api_key = " ";

exports.mailgun_domain = " ";

exports.aws_access_key_id = " ";

exports.aws_secret_key = " ";

exports.aws_region = " ";

exports.aws_bucket_name = " ";

exports.s3_file_link = " ";

exports.mail = {
    from:'moto <admin@moto.org>',
    to:'',
    subject:'',
    html:''
}; 