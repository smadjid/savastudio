const Course = require("../models/CourseSchema");
const express = require("express");
const { ObjectId } = require("mongodb");
const Session = require("../models/SessionSchema");

const router = express.Router();
router.get(`/course/:teacher`, async (req, res) => {
  const teacher = req.params.teacher;
  const courses = teacher === 'savadmin'? await Course.find():await Course.find({ teacher: teacher, disabled: { $ne: true }   });
  if (courses) return res.status(200).json(courses);
  else return res.status(400).json({ msg: "No course  found" });
});

router.get(`/learnercourse/:learner`, async (req, res) => {
  //const teacher = req.params.teacher;
  const courses = await Course.find({disabled: { $ne: true } });
  if (courses) return res.status(200).json(courses);
  else return res.status(400).json({ msg: "No course  found" });
});

router.post(`/course`, async (req, res) => {
  const { action, params } = req.body;
  if (action === "CREATE_NEW_COURSE") {
    try {
      const course = new Course(params);
      const courseSave = await course.save();

      if (courseSave) return res.status(200).json(courseSave);
      else return res.status(501).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: error.message });
    }
  } else if (action === "EDIT_COURSE_TITLE") {
    try {
      const filter = {
        _id: ObjectId(params.id),
      };
      const update = { title: params.title };
      const course = await Course.findOneAndUpdate(filter, update).exec();
      if (course) return res.status(200).json(course);
      else return res.status(500).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: error.message });
    }
  } else if (action === "ENABLE_DISABLE_COURSE") {
    try {
      const filter = {
        _id: ObjectId(params.id),
      };
      const update = { disabled: params.disabled };
      const course = await Course.findOneAndUpdate(filter, update).exec();
      if (course) return res.status(200).json(course);
      else return res.status(500).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: error.message });
    }
  }else if (action === "CREATE_NEW_COURSE_SESSION") {
    try {
      const session = new Session({
        courseID: params.courseID,
        title: params.title,
      });
      const sessionSave = await session.save();

      if (sessionSave) return res.status(200).json(sessionSave);
      else return res.status(501).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: error.message });
    }
  }else if (action === "EDIT_COURSE_SESSION_TITLE") {
    try {
      const filter = {
        _id: ObjectId(params.id),
      };
      const update = { title: params.title };
      const course = await Session.findOneAndUpdate(filter, update).exec();
      if (course) return res.status(200).json(course);
      else return res.status(500).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: error.message });
    }
  }
  else if (action === "ENABLE_DISABLE_SESSION") {
    try {
      const filter = {
        _id: ObjectId(params.id),
      };
      const update = { disabled: params.disabled };
      const session = await Session.findOneAndUpdate(filter, update).exec();
      if (session) return res.status(200).json(session);
      else return res.status(500).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: error.message });
    }
  } else return res.status(400).json({ msg: 'error.message' });
});

module.exports = router;
