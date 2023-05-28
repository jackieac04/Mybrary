const express = require('express')
const router = express.Router()
const Book = require('../models/book') // don't forget to require your Book model

router.get('/', async (req, res) => {
    let books
    try {
        books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
    } catch (error) {
        console.log(error)
        books = []
    }
    res.render('index', { books: books })
});

module.exports = router
