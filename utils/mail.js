const ejs = require('ejs');
const config = require('../utils/config');
const mailgun = require('mailgun-js')({ apiKey:config.mailgun_api_key, domain:config.mailgun_domain });

module.exports = (user, subject, filePath, next) => {
    const mail = { ...config.mail };
    mail.subject = subject;

    ejs.renderFile(filePath, {
        user:user,
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