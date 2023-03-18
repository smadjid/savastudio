const mongoose = require('mongoose')
const { ObjectId } = require("mongodb");

const SessionSchema = new mongoose.Schema({
  order: {
    type: Number,
  },
  title: {
    type: String,
  },
  duration: {
    type: Number,
  },
  courseID: {
    type: ObjectId,
  },
  disabled: {
    type: Boolean,
    default: false
  },
})

const Session = mongoose.model('Session', SessionSchema)

module.exports = Session

