const mongoose = require('mongoose')
const { ObjectId } = require("mongodb");

const TroubleSchema = new mongoose.Schema({
  runID: {
    type: ObjectId,
  },
  student: {
    type: String,
  },
  type: {
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

const Troubles = mongoose.model('Troubles', TroubleSchema)

module.exports = Troubles
