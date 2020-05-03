const shortid = require("shortid");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({
  transactions: []
}).write();
db.defaults({
  users: []
}).write();
var getTransaction = (req, res) => {
  let books = db.get("books").value();
  let users = db.get("users").value();
  let transactions = db.get("transactions").value();
  var userMain = db.get('users').find({
    id: req.signedCookies.userId
  }).value();
  let changeTrans = transactions.map(trans => {
    let book = books.find(book => book.id === trans.bookId);
    let user = users.find(user => user.id === trans.userId);
    
 
    return {
      bookTitle: book.title,
      userName: user.username,
      isComplete: trans.isComplete,
      id: trans.id


    };
  });
  res.render("transactions/index", {
    transactions: changeTrans,
    books,
    users,
    user:userMain
  });
};
var getCreateTransaction = (req, res) => {
  let books = db.get("books").value();
  let users = db.get("users").value();
  res.render("transactions/create", {
    books,
    users,
  });
};
const postCreateTransaction = (req, res) => {
  req.body.id = shortid.generate();
  db.get("transactions")
    .push({
      id: req.body.id,
      userId: req.body.userId,
      bookId: req.body.bookId,
      isComplete: false
    })
    .write();
  res.redirect("/transaction");
};
const finish = function (req, res) {
  var id = req.params.id;
  let transactions = db.get("transactions");
  var transaction = transactions.find({
    id: id
  }).value();
    return res.render("transactions/finish", );
};
module.exports = {
  getTransaction,
  getCreateTransaction,
  postCreateTransaction,
  finish
};