var express = require("express");
var router = express.Router();
const { Storage } = require("@google-cloud/storage");
var { emailEncode } = require("../bin/encodeDecode");
var path = require("path");
var multer = require("multer");

let storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "-" + file.originalname);
  },
});

let multerPortfolioImage = multer({
  storage: storage,
}).single("portfolio_image");

//Google cloud client
const gc = new Storage({
  keyFilename: path.join(__dirname, "../kingshire-344704-c468a6ed0dcd.json"),
  projectId: "kingshire-344704",
});

const bucketName = "kingshireimages";
gcUserFiles = gc.bucket(bucketName);

// Upload to cloud
async function uploadRemoteFile(filePath) {
  try {
    let encodedName = emailEncode(filePath) + path.extname(filePath);
    await gc.bucket(bucketName).upload(filePath, {
      destination: encodedName,
    });
    console.log(`${filePath} uploaded to ${bucketName}`);
  } catch (error) {
    throw error;
  }
}

// Delete Function on cloud
async function deleteRemoteFile(req) {
  try {
    let url = req.body["current_src"];
    var portfolio_image = req.user.portfolio.filter(function (value) {
      return value.pictureURL === url;
    })[0];

    fileName = portfolio_image.name + portfolio_image.fileType;

    await gc.bucket(bucketName).file(fileName).delete();
  } catch (error) {
    throw error;
  }
}

// Update db
function addToDB(req, res) {
  let user = req.user;
  let filePath = req.file.path;
  let description = req.body["image_info"];
  let encodedPath = emailEncode(filePath);
  let encodedName = encodedPath + path.extname(filePath);

  user.portfolio.push({
    pictureURL:
      "https://storage.cloud.google.com/kingshireimages/" + encodedName,
    description: description,
    name: encodedPath,
    fileType: path.extname(filePath),
  });

  user.save((err) => {
    if (err) {
      throw err;
    }
    console.log("Portfolio image Sent to DB successfully!");
    req.flash("success_message", "Portfolio Successfully updated");
    res.redirect(`back`);
  });
}

function deleteFromDB(req, res) {
  let url = req.body["current_src"];
  var portfolio_image = req.user.portfolio.filter(function (value) {
    return value.pictureURL === url;
  })[0];

  req.user.portfolio.pull({ _id: portfolio_image._id });

  req.user.save((err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log("Portfolio image deleted from DB successfully!");
    req.flash("success_message", "Portfolio Successfully Deleted");
    res.redirect(`back`);
  });
}

// Routes
router.post("/upload", multerPortfolioImage, function (req, res, next) {
  try {
    uploadRemoteFile(req.file.path).catch(console.error);
    addToDB(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/delete", multerPortfolioImage, function (req, res, next) {
  try {
    deleteRemoteFile(req);
    deleteFromDB(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
