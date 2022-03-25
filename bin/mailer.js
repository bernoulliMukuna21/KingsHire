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

function mailerFunction(recipientEmail, subject, mailTitle, mailBody) {
    return {
        to: recipientEmail,
        from: process.env.ADMINISTRATION_EMAIL,
        subject: subject,
        html: ` <style>
            body{
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .email-container{
                background-color: white;
            }
            .logoHeader{
                text-align: center; 
                background-color: #FCFCDB; 
                box-shadow: 0 15px 10px -15px #FEB2BC;
                padding: 20px;
            }
            .emailContent{
                margin: 20px;
                text-align: center;
            }
            
            .welcomeTitle{text-align: center;}
            
            .emailFooter{
                text-align: center;
            }
            .welcomeTitle{
                color: #1E88E5;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 32px;
                margin-top: 10px;
                font-weight: bold;
            }
            .emailBody{
                margin-top: 40px;
                margin-bottom: 80px;
            }
            .emailBtn{
                padding: 16px 20px;
                border-radius: 10px;
            }
            .emailFooter{
                margin-top: 60px;
            }
        </style><body style="background-color: gray">
        <div class="email-container">
            <div class="logoHeader">
                <a href="https://kingshire.herokuapp.com"  target="_blank">
                    KingsHire
                </a>
            </div>
            <div class="emailContent">
                <div class="welcomeTitle">
                    ${mailTitle}
                </div>
                <div class="emailBody">
                    ${mailBody}
                    <P>
                        Thank you,
                        <br><br>
                        The KingsHire Team
                    </P>
                </div>
                <a href="https://kingshireproject.herokuapp.com/services" class="emailBtn" style="background-color: #ee7182; color: white; text-decoration: none">
                    Find Freelancers
                </a>
            </div>
            <div class="emailFooter">
                Follow us on
                <br>
                <a href="https://kingsch.at/h/"  target="_blank">
                    KingsChat
                </a>
            </div>
        </div>
            </body>`
    };
}
module.exports = {smtpTransport, mailerFunction}
