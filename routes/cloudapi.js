var express = require('express');
var router = express.Router();
const { Storage } = require("@google-cloud/storage");
var { emailEncode, emailDecode } = require("../bin/encodeDecode");
var path = require('path');
var multer = require('multer');
var UserModel = require("../models/UserModel");

let storage = multer.diskStorage({
  filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now()
          + path.extname(file.originalname));
  }
});

let multerUserPortfolio = multer({
  storage: storage
}).single('user_profile_picture');


// Google cloud code
const gc = new Storage({
    keyFilename: path.join(__dirname, "../kingshire-344704-280e7a365b8c.json"),
    projectId: "kingshire-344704",
  });
  
  const bucketName = "kingshire";
  gcUserFiles = gc.bucket(bucketName);
  
// Upload Function
async function uploadFile(email, filePath) {
    await gc.bucket(bucketName).upload(filePath, {
      destination: emailEncode(email + path.parse(filePath).base),
    });
  
    console.log(`${filePath} uploaded to ${bucketName}`);
}

// Delete Function


router.post('/', multerUserPortfolio, (req, res, next) => {
  let filePath = req.body;
  let email = req.user().email;
  console.log(email, filePath)
})

module.exports = router;