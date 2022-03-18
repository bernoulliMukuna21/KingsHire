var CryptoJS = require('crypto-js');

module.exports = {
    emailEncode: function (email) {
        const encodedEmail = CryptoJS.enc.Utf8.parse(email);
        const encoded = CryptoJS.enc.Base64.stringify(encodedEmail);

        return encoded
    }
,
    emailDecode: function (encodedEmail) {
        const encodedWord = CryptoJS.enc.Base64.parse(encodedEmail);
        const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);

        return decoded
    }
}