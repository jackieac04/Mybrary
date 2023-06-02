const express = require('express') //require: a way to use modules, makes code more readable (express is a popular module)
const router = express.Router() //creates a new router used to define routes and middleware specific to a particular module or component.
const Author = require('../models/author') //gives access to the author model
const Book = require('../models/book')

//All authors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name !== null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i') //case insensitive regex
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors : authors,
             searchOptions: req.query //renders search options
            }) //defines a GET route that renders the page
    } catch {
        res.redirect('/')
    }
})

//New Author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()}
    )})

//Create author route
router.post('/', async (req, res) => {
    const author = new Author({
      name: req.body.name
    })
    try {
        // Check if an author with the same name already exists
        const existingAuthor = await Author.findOne({ name: req.body.name }) //findOne() = finds existing field, req.body.name compares inputted name w database
        if (existingAuthor) {
            // Handle situation where author already exists (e.g., by sending an error message)
            res.render('authors/new', {
                author: author,
                errorMessage: 'Author already exists'
            })
        } else {
            if (req.body.name == '' || req.body.name == ' ') {
                res.render('authors/new', {
                    author: author,
                    errorMessage: 'Error creating Author'
                })
            } else {
                 // Save new author if it doesn't already exist
                const newAuthor = await author.save()
                res.redirect(`/authors/${newAuthor.id}`);
            }
           
        }
    } catch (err) { // if a name is not provided
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})

//Show Author Route
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).exec()
        res.render('authors/show', {
          author: author,
          booksByAuthor: books
        })
      } catch {
        res.redirect('/')
      }
}) //signifies an id is passed along w the request

//Edit Author Route
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id) //findById is a built in mongoose method that checks if thing exists from given key
        res.render('authors/edit', {author: author})
    } catch (err) {
        res.redirect('/authors')
    }
}) 

//Update Author Route
router.put('/:id', async (req, res) => { 
    let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name //actually updates the name by changing the name param to whatever is in the body of the box
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
}) //put is for updating routes

//Delete Author Route
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        if (author == null) {
            console.log('No author found with id', req.params.id)
            return res.redirect('/') // Or some other error handling
        }
        
        // Check for associated books before deleting
        const books = await Book.find({ author: author.id })
        if (books.length > 0) {
            console.error('This Author has ' + books.length + ' books')
            res.redirect('/authors/')
            // Handle situation where author has associated books (e.g., by sending an error message)
        } else {
            // If no associated books, proceed with deletion
            await Author.deleteOne({ _id: author.id })
            res.redirect('/authors/')
        }
    } catch (err) {
        console.log('Error deleting author:', err)
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})


//we can't put or delete from a browser w/o installing a library

module.exports = router //exports the router object as a module, making it available for other files to import and use
