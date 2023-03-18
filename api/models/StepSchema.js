const { ObjectId } = require("mongodb");
const mongoose = require('mongoose')

const StepSchema = new mongoose.Schema({
  order: {
    type: Number,
  },
  title: {
    type: String,
  },
  status: {
    type: String,
  },
  grade: {
    type: String,
  },
  duration: {
    type: Number,
    default: 0
  },
  expDuration: {
    type: Number,
    default: 0
  },
  locked: {
    type: Boolean,
    default: false
  },
  synchro: {
    type: Boolean,
    default: false
  },
  sessionID: {
    type: ObjectId,
  },
})

const Step = mongoose.model('Step', StepSchema)

module.exports = Step
