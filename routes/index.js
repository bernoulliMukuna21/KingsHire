/*
 * Author: Bernoulli Mukuna
 * created: 10/05/2020
 */
var express = require("express");
const { Storage } = require("@google-cloud/storage");
var router = express.Router();
var UserModel = require("../models/UserModel");
var mailer = require("../bin/mailer");
var { emailEncode, emailDecode } = require("../bin/encodeDecode");
var { imageToDisplay } = require("../bin/imageBuffer");
const { pathToFileURL } = require("url");
const path = require("path");

let administrationemail = process.env.ADMINISTRATION_EMAIL;

// Google cloud code
const gc = new Storage({
  keyFilename: path.join(__dirname, "../kingshire-344704-280e7a365b8c.json"),
  projectId: "kingshire-344704",
});

const bucketName = "kingshire";
gcUserFiles = gc.bucket(bucketName);

// Upload Function
async function uploadFile(user_id, filePath) {
  await gc.bucket(bucketName).upload(filePath, {
    destination: user_id,
  });

  console.log(`${filePath} uploaded to ${bucketName}`);
}

//uploadFile().catch(console.error);

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    let loggedInUser;
    let loggedInUser_imageSrc;
    let allFreelancers;

    let isLogged = req.isAuthenticated();
    let trial_days = 30;

    let findFreelancersQuery = [
      {
        "user_stature.initial": "freelancer",
      },
      {
        "serviceAndPrice.0": { $exists: true },
      },
      {
        $or: [
          { is_subscribed: true },
          {
            $and: [
              { is_subscribed: false },
              {
                $expr: {
                  $lte: [
                    {
                      $trunc: {
                        $divide: [
                          { $subtract: ["$$NOW", "$date"] },
                          1000 * 60 * 60 * 24,
                        ],
                      },
                    },
                    trial_days,
                  ],
                },
              },
            ],
          },
        ],
      },
    ];

    if (isLogged) {
      loggedInUser = req.user;
      loggedInUser_imageSrc = imageToDisplay(loggedInUser);

      findFreelancersQuery.push({
        email: { $ne: loggedInUser.email },
      });
      allFreelancers = await UserModel.find({
        $and: findFreelancersQuery,
      });
    } else {
      allFreelancers = await UserModel.find({
        $and: findFreelancersQuery,
      });
    }

    res.render("index", {
      allFreelancers,
      loggedInUser,
      loggedInUser_imageSrc,
      isLogged,
      emailEncode,
    });
  } catch (error) {
    return next(error);
  }
});

//localhost:3000/login
router.get("/login", function (req, res, next) {
  res.redirect("/users/login");
});
//localhost:3000/join
router.get("/join", function (req, res, next) {
  res.redirect("/users/join");
});

router.post("/feedback", function (req, res, next) {
  let mailerBody = req.body;

  if (!mailerBody.mail) {
    mailerBody.mail = "empty";
  }

  if (mailerBody.name && mailerBody.mail && mailerBody.comment) {
    try {
      let feedbackHTML =
        '<h1 style="color: #213e53; font-size: 1.1rem">Feeback Received</h1>' +
        `<p><span style="font-weight: bold">Sender:</span> ${mailerBody.name}</p>` +
        `<p><span style="font-weight: bold">Email:</span> ${mailerBody.mail}</p>` +
        `<p><span style="font-weight: bold">Comment:</span> ${mailerBody.comment}</p>`;

      mailer.smtpTransport.sendMail(
        mailer.mailerFunction(
          administrationemail,
          "KingsHire - Feedback",
          feedbackHTML
        ),
        function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Feeback Email sent to Administration");
            res.sendStatus(200);
          }
        }
      );
    } catch (e) {
      res.sendStatus(404);
    }
  }
});

module.exports = router;
