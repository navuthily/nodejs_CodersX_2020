const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
const fs = require("fs");
var cloudinary = require('cloudinary').v2
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Set some defaults
db.defaults({
  users: []
}).write();
// for parsing routerlication/x-www-form-urlencoded

const shortid = require("shortid");
var users = db.get("users");
const getUser = function (req, res) {
  var user = users.find({
    id: req.signedCookies.userId
  }).value();
  res.render("users/index", {
    users: users.value(),
    user: user
  });

};
const getSearch = function (req, res) {
  var q = req.query.q;
  var matched = users.value().filter(function (user) {
    return user.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  });
  var user = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  res.render("users/index", {
    users: matched,
    user: user
  });
};
const getCreate = function (req, res) {
  var user = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  res.render("users/create", {
    user
  });
};
const postCreate = function (req, res) {
  req.body.id = shortid.generate();
  var errors = [];
  if (!req.body.username) {
    errors.push('Name is required!')
  }
  if (req.body.username.length > 10) {
    errors.push('Tên không hợp lệ.')
  }
  if (errors.length) {
    return res.render("users/create", {
      errors: errors,
      values: req.body
    });
  } else {
    users.push(req.body).write();
    return res.redirect("/user");
  }
};

const viewDetailUser = function (req, res) {
  var id = req.params.id;
  var user = users.find({
    id: id
  }).value();
  return res.render("users/view", {
    user
  });
};
const deleteUser = function (req, res) {
  var id = req.params.id;
  users
    .remove({
      id: id
    })
    .write();
  return res.redirect("/user");
};
const editUser = async function (req, res) {
  console.log(req.file);
  console.log(req.file.path);
  console.log(req.body.username);

const file = req.file.path;

// console.log('body', req.body)
const path = await cloudinary.uploader
  .upload(file)
  .then(result => result.url)
  .catch(error => console.log("erro:::>", error));


  const {
    originalname,
  } = req.file;
  console.log(originalname);
  users
    .find({
      id: req.signedCookies.userId
    })
    .assign({
      username: req.body.username,
      avatar: path
    })
    .write();
    if(req.file){
      fs.unlinkSync(req.file.path);
    }
  return res.redirect("/home");
};
const getEdit = function (req, res) {
  var user = users.find({
    id: req.signedCookies.userId
  }).value();
  res.render('users/editProfile', {
    user
  })
};

module.exports = {
  getUser,
  getSearch,
  getCreate,
  postCreate,
  viewDetailUser,
  deleteUser,
  editUser,
  getEdit
}