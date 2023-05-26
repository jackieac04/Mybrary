const express = require('express') //require: a way to use modules, makes code more readable (express is a popular module)
const router = express.Router() //creates a new router used to define routes and middleware specific to a particular module or component.
const Author = require('../models/author') //gives access to the author model

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
        const newAuthor = await author.save()
        //res.redirect(`/authors/${newAuthor.id}`);
        res.redirect('/authors');
    } catch { //never happens ?? :sob:
        console.error('Error caught in catch block', err);
        errorMessage : 'Error creating Author';
        res.render('authors/new', {
            author: author
        })
    }
})

module.exports = router //exports the router object as a module, making it available for other files to import and use
