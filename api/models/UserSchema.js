const { ObjectId } = require("mongodb");
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profile: {
    type: String,
  },
  runningCourseID: {
    type: ObjectId,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model('User', UserSchema)

module.exports = User
