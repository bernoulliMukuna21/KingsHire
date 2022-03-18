var nodemailer = require('nodemailer');

let smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        type: 'OAuth2',
        user: process.env.ADMINISTRATION_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_ID,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: null,
        expires: 1484314697598
    },
    tls: { rejectUnauthorized: false }
});
function mailerFunction(recipientEmail, subject, messageHTML) {
    return {
        to: recipientEmail,
        from: process.env.ADMINISTRATION_EMAIL,
        subject: subject,
        html: messageHTML
    };
}
module.exports = {smtpTransport, mailerFunction}
