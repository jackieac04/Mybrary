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
        res.redirect(`/books/${newBook.id}`);
    } catch (err) {
        renderNewPage(res, book, true)
    }
})

  //Show book route
  router.get('/:id', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec() //populates author var. in book obj. w all author info
        res.render('books/show', {book : book})
    } catch (err) {
        res.redirect('/')
    }
  })


//Edit book route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch (err) {
        res.redirect('/')
    } 
})

//Update book route
router.put('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover != '') {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (err) {
        if (book != null) {
            renderEditPage(res, book, true)
        } else {
            res.redirect('/')
        } 
    }
})

//Delete book route
router.delete('/:id', async (req,res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        if (book == null) {
            console.log('No book found with id', req.params.id)
            res.redirect('/')
        } else {
            // If no associated books, proceed with deletion
            await Book.deleteOne({ _id: book.id })
            res.redirect('/books/')
        }
    } catch (err) {
        console.log('Error deleting book:', err)
        if (book == null) {
            res.redirect('/')
        } else {
            res.render('books/show', {
                book : book, 
                errorMessage : 'Could not remove book'
            })
        }
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
    renderFormPage(res, book, 'new', hasError)
  }
  
  async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
  }
  
async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
        authors: authors,
        book: book
        }
        if (hasError) {
        if (form === 'edit') {
            params.errorMessage = 'Error Updating Book'
        } else {
            params.errorMessage = 'Error Creating Book'
        }
        }
        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}

module.exports = router //exports the router object as a module, making it available for other files to import and use
