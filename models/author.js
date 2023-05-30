const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    }
}) // a structure that represents the shape of the documents within
 //a MongoDB collection. It defines the fields, types, and validation
 // rules for the data stored in the collection.

 authorSchema.pre("deleteOne", async function (next) {
    try {
        const query = this.getFilter();
        const hasBook = await Book.exists({ author: query._id });
  
        if (hasBook) {
            next(new Error("This author still has books."));
        } else {
            next();
        }
    } catch (err) {
        next(err); 
    }
    })

 module.exports = mongoose.model('Author', authorSchema) //Author = name of table inside database, authorSchema = defines database