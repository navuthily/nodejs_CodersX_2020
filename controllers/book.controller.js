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
  books: []
}).write();
// for parsing routerlication/x-www-form-urlencoded
db.defaults({
  users: []
}).write();
const shortid = require("shortid");
var books = db.get("books");
const getBook = function (req, res) {
  var perPage = 8;
  var page = parseInt(req.query.page) || 1;
  var start = (page - 1) * perPage;
  var end = page * perPage;

  var user = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  var sessions = db.get("sessions").value();
  var sum=0;

  console.log(sessions[sessions.length - 1])
  var a = sessions[sessions.length - 1];
  var y = Object.values(a.cart);
  for (let i = 0; i < y.length; i++) {
    sum += y[i];

  }

  console.log(sum);
  res.render("books/index", {
    books: books.value().slice(start, end),
    user: user,
    sum: sum
  });

};
const getSearch = function (req, res) {
  var q = req.query.q;
  var user = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  var matched = books.value().filter(function (book) {
    return book.title.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  });
  res.render("books/index", {
    books: matched,
    user: user
  });
};
const getCreate = function (req, res) {
  var user = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  res.render("books/create", {
    user
  });
};
const postCreate = async function (req, res) {
  req.body.id = shortid.generate();
  const file = req.file.path;
  console.log(file);
  const path = await cloudinary.uploader
    .upload(file)
    .then(result => result.url)
    .catch(error => console.log("erro:::>", error));

  books.push({
    id: req.body.id,
    title: req.body.title,
    description: req.body.description,
    cover: path,
    price: req.body.price
  }).write();
  if (req.file) {
    fs.unlinkSync(req.file.path);
  }
  return res.redirect("/book");
};
const viewDetailBook = function (req, res) {
  var user = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  var id = req.params.id;
  var book = books.find({
    id: id
  }).value();
  return res.render("books/view", {
    book,
    user
  });
};
const deleteBook = function (req, res) {
  var id = req.params.id;
  books
    .remove({
      id: id
    })
    .write();
  return res.redirect("/book");
};
const editBook = function (req, res) {
  var id = req.params.id;
  books
    .find({
      id: id
    })
    .assign({
      title: req.body.title
    })
    .write();
  return res.redirect("/book");
};
module.exports = {
  getBook,
  getSearch,
  getCreate,
  postCreate,
  viewDetailBook,
  deleteBook,
  editBook
}