const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const LearnerStepSchema = new mongoose.Schema({
  runID: {
    type: ObjectId,
  },
  student: {
    type: String,
  },
  stepID: {
    type: ObjectId,
  },
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
  beginDate: {
    type: Date,
  },
  duration: {
    type: Number,
    default: 0
  },
  difftime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  sessionID: {
    type: ObjectId,
  },
  locked: {
    type: Boolean,
    default: false
  },
  synchro: {
    type: Boolean,
    default: false
  },
});

const LearnerStep = mongoose.model("LearnerStep", LearnerStepSchema);

module.exports = LearnerStep;
