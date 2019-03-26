require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const urlencode = require("urlencode");
const username = process.env.TEXTLOCAL_USERNAME;
const hash = process.env.TEXTLOCAL_API;
const sender = "txtlcl";
// const path = require("path");
// const ejs = require("ejs");
// const cors = require("cors");

//Schemas
const User = require("./Models/userSchema");
const Admin = require("./Models/adminSchema");
const Details = require("./Models/detailsSchema");
const Donor = require("./Models/donorlis");
//Database Connection
mongoose.connect(
  process.env.DATABASE_NAME,
  { useNewUrlParser: true },
  (err, db) => {
    if (err) console.log("Unable to connect to the mongodb");
    else console.log("Connection established to mongdb");
  }
);

// const donorlist = require("./donors_list.json");
// console.log(donorlist);
//To avoid cors error,CORS plugin is used
// app.use(cors({ origin: "http://localhost:3000" }));

//MiddleWare To  avoid cors error
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// app.use(express.static(__dirname + "/../client/public"));
// console.log(__dirname + "/../client/public");

// app.set("view engine", "html");
// app.engine("html", ejs.renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//initial page
// console.log(__dirname);

app.get("/", (req, res) => {
  res.send("I'm alive");
});
// donorlist.map(data => {
//   Donor.create(data, (err, result) => {
//     if (err) console.log(err.message);
//     else console.log(result);
//   });
// });
//Signup route
app.post("/signup", async (req, res) => {
  console.log("sign up called");
  // console.log(req.body.data);
  let alreadyExists = false;
  await User.findOne({ username: req.body.data.username }, (err, result) => {
    if (result == null || result.length === 0) {
      return;
    } else if (err) {
      console.log(err.message);
    } else {
      console.log(result);
      alreadyExists = true;
    }
  });
  // await console.log(alreadyExists);
  if (!alreadyExists) {
    await User.create(
      {
        username: req.body.data.username,
        password: req.body.data.password,
        name: req.body.data.name,
        age: req.body.data.age,
        bloodgroup: req.body.data.bloodgroup,
        phone: req.body.data.phone
      },
      (err, user) => {
        if (err) {
          console.log("error occured");
          res.send({ isError: true, message: err.message });
        } else {
          console.log("Success");
          res.send({ isError: false, message: "Signed Up succesfully" });
        }
      }
    );
  } else {
    res.send({ isError: true, message: "Already username exists" });
  }
});

//login route
app.post("/login", (req, res) => {
  console.log("login called");
  User.findOne({ username: req.body.data.username }, (err, result) => {
    if (result == null || result.length === 0) {
      console.log("Username does not exists ");
      res.send({ isError: true, message: "Username does not exists" });
    } else if (err) {
      console.log(err.message);
      res.send({ isError: true, message: err.message });
    } else {
      if (result.password === req.body.data.password) {
        console.log("Successfully logedIn");
        res.send({ isError: false, message: "Succesfully logedIn" });
      } else {
        console.log("Username or password is Incorrect");
        res.send({
          isError: true,
          message: "Username or password is Incorrect"
        });
      }
    }
  });
});

//Admin login
app.post("/adminlogin", (req, res) => {
  console.log("Admin login is called");
  Admin.findOne({ adminname: req.body.adminName }, (err, result) => {
    console.log(req.body.adminName + " " + req.body.password);
    console.log(result);
    if (result === null || result.length == 0) {
      console.log("Admin Id does not exists");
      res.send({ isError: true, message: "Admin Id does not exists" });
    } else if (err) res.send({ isError: true, message: err.message });
    else {
      if (result.password === req.body.adminName) {
        return res.send({ isError: false, message: "Succesfully logged in" });
      }
      return res.send({ isError: false, message: "Admin logged in" });
    }
  });
});

//getting the information
app.get("/details", (req, res) => {
  // console.log(req);
  Details.find({}, (err, result) => {
    if (err) {
      console.log(err.message);
      res.send({ isError: true, message: err.message });
    } else {
      console.log("Fetched all informations");
      res.send({ isError: false, message: result });
    }
  }).sort({ $natural: -1 }); //$natural:1 || -1 1 will fetch oldest to newset ,-1 newest to oldest
});
//Posting the information
app.post("/details", (req, res) => {
  // console.log(req.body.bloodGroup);
  let patientName = req.body.patientName,
    bloodGroup = req.body.bloodGroup.toLowerCase(),
    contactNumber = req.body.contactNumber,
    additionalMessage = req.body.additionalMessage,
    address = req.body.address;
  // status = req.body.status;
  let messageBody = `Blood required for ${patientName} of type ${bloodGroup} admitted at ${address},for contact number:${contactNumber}`;
  Donor.find({ blood_group: bloodGroup }, (err, result) => {
    if (err) console.log(err.message);
    else {
      console.log(result);
      // let toNumbers;
      let sendData;
      result.map(data => {
        sendData =
          "username=" +
          username +
          "&hash=" +
          hash +
          "&sender=" +
          sender +
          "&numbers=" +
          data.contact_no +
          "&message=" +
          urlencode(messageBody);
      });
      console.log(sendData);
      var options = {
        host: "api.textlocal.in",
        path: "/send?" + sendData
      };
      callback = function(response) {
        var str = ""; //another chunk of data has been recieved, so append it to `str`
        response.on("data", function(chunk) {
          str += chunk;
        }); //the whole response has been recieved, so we just print it out here
        response.on("end", function() {
          console.log(str); //logs the message details
        });
      };
      http.request(options, callback).end(); //url encode instalation need to use $ npm install urlencode
    }
  }).limit(1);

  Details.create(
    { patientName, bloodGroup, contactNumber, additionalMessage, address },
    (err, result) => {
      if (err) {
        console.log(err.message);
        res.send({ isError: true, message: err.message });
      } else {
        console.log(result);
        res.send({ isError: false, message: result });
      }
    }
  );
});

app.get("/logout", (req, res) => {
  res.send({ message: "Sigout called" });
});
//Server listening to the port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
