var express = require('express')
var router = express.Router();
const{
  getBook,
  getSearch,
  getCreate,
  postCreate,
  viewDetailBook,
  deleteBook,
  editBook
}=require('../controllers/book.controller')
const {
  uploadMulter,
} = require('../models/multer');
router.get("/",getBook);
router.get("/search", getSearch);
router.get("/create", getCreate);
router.post("/create", uploadMulter.single('cover'), postCreate);
router.get("/view/:id", viewDetailBook);
router.delete("/delete/:id", deleteBook);
router.put('/edit/:id', editBook)


module.exports = router;