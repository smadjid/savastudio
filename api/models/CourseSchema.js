const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  teacher: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false
  },
})

const Course = mongoose.model('Course', CourseSchema)

module.exports = Course
