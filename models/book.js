const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    description : {
        type : String
    },
    publishDate : {
        type: Date,
        required : true
    },
    pageCount : {
        type : Number,
        required: true
    },
    createdAt : {
        type : Date,
        required: true,
        default: Date.now
    },
    coverImage : {
        type: Buffer, //handles binary data
        required: true
    } , //store the image in the file system
    coverImageType : {
        type : String,
        required : true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, //tells mongoose that this references another object in the collection
        required: true,
        ref: 'Author'
    }

}) // a structure that represents the shape of the documents within
 //a MongoDB collection. It defines the fields, types, and validation
 // rules for the data stored in the collection.

bookSchema.virtual('coverImagePath').get(function() { //we don't use an arrow function because we need access to this.
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
}) ///derives value from schema

 module.exports = mongoose.model('Book', bookSchema) //Book = name of table inside database, bookSchema = defines database