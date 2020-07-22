const path = require('path');

exports.databaseConnectionString = 'mongodb+srv://Olamileke:Arsenalfc1886@cluster0.m7yww.mongodb.net/moto?retryWrites=true&w=majority'

exports.app_url = 'http://localhost:1000/';

exports.client_url = 'http://localhost:4200/'

exports.secret_key = 'mYYP2dJBNeyclufoYuEJkjhnkljkjsdfhkjdlfk';

exports.app_root = path.dirname(process.mainModule.filename);

exports.per_page = 9;

exports.mailgun_api_key = "key-618e6125c452b712ee91e57f028fbd0f";

exports.mailgun_domain = "sandboxb3e06f45528541edbc677fe253ca0c00.mailgun.org";

exports.aws_access_key_id = "AKIAWQHYH6CUULOEAIXW";

exports.aws_secret_key = "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";

exports.aws_region = "us-east-2";

exports.aws_bucket_name = "themotobucket";

exports.s3_file_link = "https://s3-us-east-2.amazonaws.com/themotobucket/";

exports.mail = {
    from:'moto <admin@moto.org>',
    to:'',
    subject:'',
    html:''
}; 