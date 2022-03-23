var express = require("express");
var router = express.Router();
const { Storage } = require("@google-cloud/storage");
var { emailEncode, emailDecode } = require("../bin/encodeDecode");
var path = require("path");
var multer = require("multer");

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
async function uploadRemoteFile(filePath) {
  let encodedName = emailEncode(filePath) + path.extname(filePath);
  await gc.bucket(bucketName).upload(filePath, {
    destination: encodedName,
  });
  console.log(`${filePath} uploaded to ${bucketName}`);
}

// Delete Function on cloud
async function deleteRemoteFile(req) {
  let url = req.body["current_src"];
  var portfolio_image = req.user.portfolio.filter(function (value) {
    return value.pictureURL == url;
  })[0];
  fileName = portfolio_image.name + portfolio_image.fileType;
  console.log(fileName);
  await gc.bucket(bucketName).file(fileName).delete();
  console.log(`gs://${bucketName}/${fileName} deleted`);
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
  var portfolio_image = req.user.portfolio.filter(function (value) {
    return value.pictureURL == url;
  })[0];

  // req.user.update(
  //   { _id: portfolio_image._id },
  //   { $pull: { portfolio: { pictureURL: url } } }
  // );
  req.user.portfolio.pull({ _id: portfolio_image._id });
  console.log(req.user.portfolio);
  req.user.save((err) => {
    if (err) {
      throw err;
    }
    console.log("Portfolio image deleted from DB successfully!");
  });
}

// Routes
router.post("/upload", multerPortfolioImage, function (req, res, next) {
  uploadRemoteFile(req.file.path).catch(console.error);
  addToDB(req);
});

router.post("/delete", multerPortfolioImage, function (req, res, next) {
  deleteRemoteFile(req);
  deleteFromDB(req);
});

module.exports = router;
