const { ObjectId } = require("mongodb");

const UserSchema = require("../models/UserSchema");

const SessionSchema = require("../models/SessionSchema");
const StepSchema = require("../models/StepSchema");
const bcrypt = require("bcrypt");
const express = require("express");
const Course = require("../models/CourseSchema");
const router = express.Router();

router.get(`/sessions/:courseId`, async (req, res) => {
  const sessions = req.params.courseId
    ? await SessionSchema.find({ courseID: ObjectId(req.params.courseId), disabled: { $ne: true }  })
    : await SessionSchema.find({});
  if (!sessions) {
    return res.status(400).json({ msg: "No session found" });
  }
  return res.status(200).json(sessions); // attach user session id to the response. It will be transfer in the cookies
});

router.get(`/steps`, async (req, res) => {
  const steps = await StepSchema.find({});
  if (!steps) {
    return res.status(400).json({ msg: "No session found" });
  }
  return res.status(200).json(steps); // attach user session id to the response. It will be transfer in the cookies
});

router.get(`/sessionsteps/:sessionId`, async (req, res) => {
  if (req.params.sessionId === "undefined" || req.params.sessionId === "null")
    return res.status(500).json({ msg: "error" });
  const steps = await StepSchema.find({
    sessionID: ObjectId(req.params.sessionId),
  });
  if (!steps) {
    return res.status(400).json({ msg: "No session found" });
  }
  return res.status(200).json(steps); // attach user session id to the response. It will be transfer in the cookies
});

router.post(`/sessionsteps`, async (req, res) => {
  const params = req.body;

  if (!params) return res.status(400).json({ msg: "No session found" });

  if (params.action === "ADD_SESSION_STEP") {
    const update = req.body.params;
    try {
      const stepRes = new StepSchema(update);
      const savedStepRes = await stepRes.save();

      if (savedStepRes) return res.status(200).json(savedStepRes);
      else return res.status(501).json({ msg: "error" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: "No session found" });
    }
  }

  if (params.action === "UPDATE_SESSION_STEP") {
    const update = req.body.params;
    const filter = { _id: ObjectId(update._id) };
    try {
      await StepSchema.updateOne(filter, update);
      const step = await StepSchema.findOne({ _id: ObjectId(update._id) });
      return res.status(200).json(step);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: "No session found" });
    }
  }
});

router.delete(`/step/:stepID`, async (req, res) => {
  await StepSchema.findOneAndDelete({ _id: req.params.stepID }).exec(
    (err, step) => {
      if (err)
        return res.status(500).json({
          code: 500,
          message: "There was an error deleting the step",
          error: err,
        });
      else
        return res
          .status(200)
          .json({ code: 200, message: "Step deleted", deletedStep: step });
    }
  );
});

router.get(`/course/select`, async (req, res) => {
  const { courseid } = req.body.data;

  const sessions = await SessionSchema.find({ courseID: courseid }); // finding user in db
  if (!sessions) {
    return res.status(400).json({ msg: "No course sessions found" });
  }
  return res.status(200).json(sessions); // attach user session id to the response. It will be transfer in the cookies
});

router.get(`/session/:sessionId`, async (req, res) => {
  const sessID = req.params.sessionId;

  const session = await SessionSchema.findOne({ _id: sessID }); // finding user in db
  if (!session) {
    return res.status(400).json({ msg: "Session not found" });
  }
  return res.status(200).json(session); // attach user session id to the response. It will be transfer in the cookies
});

router.delete(`/logout`, async (req, res) => {
  req.session.destroy((error) => {
    if (error) throw error;

    res.clearCookie("session-id"); // cleaning the cookies from the user session
    return res.status(200).send("Logout Success");
  });
});

///////////////////// SESSION INTERACTIONS
router.post(`/session`, async (req, res) => {
  const { sessionid, params } = req.body;

  if (!params) return res.status(400).json({ msg: "Session not found" });
  else if (params.action === "SET_STEP_STATUS") {
    const filter = { _id: ObjectId(params.stepid) };
    const update = { status: params.status };
    try {
      await StepSchema.updateOne(filter, update);
      const step = await StepSchema.findOne({ _id: ObjectId(params.stepid) });
      return res.status(200).json(step);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: "Session not found" });
    }
  } else if (params.action === "RE_INIT_STEPS") {
    const filter = { _sessionID: ObjectId(sessionid) };
    const update = { status: params.status, grade: params.grade };
    try {
      await StepSchema.updateMany(filter, update);
      return res.status(200).json("ok");
    } catch (error) {
      return res.status(400).json({ msg: "Session not found" });
    }
  } else if (params.action === "STOP_ACTIVE_STEPS") {
    const filter = { _sessionID: ObjectId(sessionid), status: "active" };
    const update = { status: "inactive" };
    try {
      await StepSchema.updateMany(filter, update);
      return res.status(200).json("ok");
    } catch (error) {
      return res.status(400).json({ msg: "Session not found" });
    }
  } else if (params.action === "SET_STEP_GRADE") {
    const filter = { _id: ObjectId(params.stepid) };
    const update = { grade: params.grade };
    try {
      await StepSchema.updateOne(filter, update);
      const step = await StepSchema.findOne({ _id: ObjectId(params.stepid) });
      return res.status(200).json(step);
    } catch (error) {
      return res.status(400).json({ msg: "Session not found" });
    }
  } else if (params.action === "SET_STEP_DURATION") {
    const filter = { _id: ObjectId(params.stepid) };
    const update = { duration: params.duration };

    try {
      await StepSchema.updateOne(filter, update);
      const step = await StepSchema.findOne({ _id: ObjectId(params.stepid) });
      return res.status(200).json(step);
    } catch (error) {
      return res.status(400).json({ msg: "Session not found" });
    }
  } else return res.status(400).json({ msg: "Session not found" });
});

module.exports = router;
