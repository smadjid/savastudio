const mongoose = require('mongoose')
const { ObjectId } = require("mongodb");

const HelpSchema = new mongoose.Schema({
  runID: {
    type: ObjectId,
  },
  student: {
    type: String,
  },
  stepID: {
    type: ObjectId,
  },
  status: {
    type: String,
  },
  date: {
    type: Date,
  },
  rating:{
    type: Number,
    default: 3
  }
})

const Help = mongoose.model('Help', HelpSchema)

module.exports = Help
