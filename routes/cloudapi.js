var express = require("express");
var router = express.Router();
const { Storage } = require("@google-cloud/storage");
var { emailEncode, emailDecode } = require("../bin/encodeDecode");
var path = require("path");
var multer = require("multer");
var UserModel = require("../models/UserModel");
const { encode } = require("punycode");

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/data/uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "-" + file.originalname);
  },
});

let multerPortfolioImage = multer({
  storage: storage,
}).single("portfolio_image");

//Google cloud client
const gc = new Storage({
  keyFilename: path.join(__dirname, "../kingshire-344704-280e7a365b8c.json"),
  projectId: "kingshire-344704",
});

const bucketName = "kingshire";
gcUserFiles = gc.bucket(bucketName);

// Upload to cloud
async function uploadFile(filePath) {
  let encodedName = emailEncode(filePath) + path.extname(filePath);
  await gc.bucket(bucketName).upload(filePath, {
    destination: encodedName,
  });
  console.log(`${filePath} uploaded to ${bucketName}`);
}

// Delete Function on cloud
async function deleteFile(req) {
  let url = req.body["current_src"];
  let data = UserModel.findOne({ pictureURL: url });
  let portfolio = data["portfolio"];
  console.log(url);
  // let fileName = portfolio.name + portfolio.fileType;
  // await storage.bucket(bucketName).file(fileName).delete();

  // console.log(`gs://${bucketName}/${fileName} deleted`);
}

// Update db
function addToDB(req) {
  let user = req.user;
  let filePath = req.file.path;
  let description = req.body["image_info"];
  let encodedPath = emailEncode(filePath);
  let encodedName = encodedPath + path.extname(filePath);
  user.portfolio.push({
    pictureURL: "https://storage.cloud.google.com/kingshire/" + encodedName,
    description: description,
    name: encodedPath,
    fileType: path.extname(filePath),
  });

  user.save((err) => {
    if (err) {
      throw err;
    }
    console.log("Portfolio image Sent to DB successfully!");
  });
}

function deleteFromDB(req) {
  let url = req.body["current_src"];
  req.user.portfolio.deleteOne({ pictureURL: url });

  req.user.save((err) => {
    if (err) {
      throw err;
    }
    console.log("Portfolio image deleted from DB successfully!");
  });
}

// Routes
router.post("/upload", multerPortfolioImage, function (req, res, next) {
  uploadFile(req.file.path).catch(console.error);
  addToDB(req);
});

router.post("/delete", function (req, res, next) {
  deleteFile(req);
  // deleteFromDB(req);
});

module.exports = router;
