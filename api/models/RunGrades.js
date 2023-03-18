const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const RunGrades = new mongoose.Schema({
  runID: {
    type: ObjectId,
  },
  student: {
    type: String
  },
  grade: {
    type: Number,
    default: 100
  },
});

const Grades = mongoose.model("Grades", RunGrades);

module.exports = Grades;
