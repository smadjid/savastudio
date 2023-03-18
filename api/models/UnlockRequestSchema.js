const mongoose = require('mongoose')
const { ObjectId } = require("mongodb");

const UnlockRequestSchema = new mongoose.Schema({
  runID: {
    type: ObjectId,
  },
  student: {
    type: String,
  },
  stepOrder: {
    type: Number,
  },
  stepID: {
    type: ObjectId,
  },
  stStepID: {
    type: ObjectId,
  },
  status: {
    type: String,
  },
  date: {
    type: Date,
  },
})

const Unlocks = mongoose.model('UnlockRequest', UnlockRequestSchema)

module.exports = Unlocks
