const express = require('express') //require: a way to use modules, makes code more readable (express is a popular module)
const router = express.Router() //creates a new router used to define routes and middleware specific to a particular module or component.
const Book = require('../models/book') //gives access to the author model
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'images/gif']

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
router.post('/', async (req, res) => {
    const book = new Book({
      title: req.body.title,
      author : req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      description: req.body.description
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        //res.redirect(`/books/${newBook.id}`);
        res.redirect('books');
    } catch (err) {
        renderNewPage(res, book, true)
    }
})

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64') //creates a new Buffer from the cover data
      book.coverImageType = cover.type //can extract buffer and convert it back to an image of the correct type
    }
  }

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
module.exports = router //exports the router object as a module, making it available for other files to import and use
