const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    }
}) // a structure that represents the shape of the documents within
 //a MongoDB collection. It defines the fields, types, and validation
 // rules for the data stored in the collection.

 module.exports = mongoose.model('Author', authorSchema) //Author = name of table inside database, authorSchema = defines database