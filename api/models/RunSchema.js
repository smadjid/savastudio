const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const RunSchema = new mongoose.Schema({
  courseID: {
    type: ObjectId,
  },
  sessionID: {
    type: ObjectId,
  },
  currentStep: {
    type: Number,
  },
  status: {
    type: String,
    default: 'idle',
    // idle, running, paused, done
  },
  beginDate: {
    type: Date,
  },
  actualDuration: {
    type: Number,
  },
  endDate: {
    type: Date,
  },
});

const Run = mongoose.model("Run", RunSchema);

module.exports = Run;
