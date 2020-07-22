const ejs = require('ejs');
const config = require('../utils/config');
const mailgun = require('mailgun-js')({ apiKey:config.mailgun_api_key, domain:config.mailgun_domain });

module.exports = (data, subject, filePath, next) => {
    const mail = { ...config.mail };
    mail.subject = subject;
    data.reset ? mail.to = data.reset.email : mail.to = data.user.email;

    ejs.renderFile(filePath, {
        data:data,
        client_url:config.client_url
    }, (err, str) => {
        if(err) {
            next(err)
        }
        mail.html = str;
        mailgun.messages().send(mail, (err, body) => {
            if(err) {
                next(err);
            }
        })
    })

}