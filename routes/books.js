const express = require('express') //require: a way to use modules, makes code more readable (express is a popular module)
const router = express.Router() //creates a new router used to define routes and middleware specific to a particular module or component.
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const Book = require('../models/book') //gives access to the author model
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
const Author = require('../models/author')
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => { //info we want to take in and filter
        callback(null, imageMimeTypes.includes(file.mimetype)) //first is an error parameter, second is what we want to be able to accept
    }
})

//All books route
router.get('/', async (req, res) => {
    let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i')) // 'i' makes it case agnostic
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

//New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book(), false)
})

//Create book route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
      title: req.body.title,
      author : req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      coverImageName: fileName,
      description: req.body.description
    })
    try {
        const newBook = await book.save()
        //res.redirect(`/books/${newBook.id}`);
        res.redirect('books');
    } catch (err) {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors : authors,
            book : book
        }
        if (hasError) {
            params.errorMessage = 'Error Creating Book'
        }
        res.render('books/new', params)
        } catch (err) {
            res.redirect('/books')
        } 
}

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) {
            console.error(err)
        }
    }) //gets rid of file that has file name and is inside folder
}
module.exports = router //exports the router object as a module, making it available for other files to import and use
