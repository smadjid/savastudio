const { ObjectId } = require("mongodb");

const RunSchema = require("../models/RunSchema");
const SessionSchema = require("../models/SessionSchema");
const StepSchema = require("../models/StepSchema");
const LearnerStepSchema = require("../models/LearnerStepSchema");
const RunGrades = require("../models/RunGrades");

const express = require("express");
const router = express.Router();

router.get(`/runs`, async (req, res) => {
  const runs = await RunSchema.find({}).exec();
  if (runs) res.status(200).json(runs);
  else return res.status(400).json({ msg: "No session found" });
});

router.get(`/running`, async (req, res) => {
  const runs = await RunSchema.find({ running: true });
  if (runs) return res.status(200).json(runs);
  else return res.status(400).json({ msg: "No session run currently" });
});

router.get(`/courserun/:courseID`, async (req, res) => {
  const run_runs = await RunSchema.find({
    courseID: req.params.courseID,
    status: "running",
  }).exec();

  if (run_runs && run_runs.length > 0) return res.status(200).json(run_runs);
  else {
    const paused_runs = await RunSchema.find({
      courseID: req.params.courseID,
      status: "paused",
    });

    if (paused_runs && paused_runs.length > 0)
      return res.status(200).json(paused_runs);
    else return res.status(400).json({ msg: "No session run currently" });
  }
});

router.get(`/run/:runId`, async (req, res) => {
  if (
    req.params.sessionId === "undefined" ||
    req.params.sessionId === "null" ||
    req.params.runId === "undefined"
  )
    return res.status(500).json({ msg: "error" });
  else {
    const run = await RunSchema.find({
      _id: ObjectId(req.params.runId),
    });
    if (!run || run.length < 1) {
      return res.status(400).json({ msg: "No run found" });
    } else return res.status(200).json(run[0]);
  }
});

router.post(`/run`, async (req, res) => {
  const { action, id, status } = req.body;
  if (action === "NEW_RUN") {
    const ss = await SessionSchema.findOne({
      _id: ObjectId(id),
    });
    const courseId = ss ? ss.courseID : null;
    let run_info = {
      sessionID: ObjectId(id),
      courseID: courseId,
      currentStep: -1,
      status: "paused",
      beginDate: new Date(),
    };

    const newRun = new RunSchema(run_info);

    const savedRunRes = await newRun.save();

    if (savedRunRes) return res.status(200).json(savedRunRes._id);
    else return res.status(501).json({ msg: "error" });
  } else if (action === "GET_ACTIVE_RUN") {
    let run_info = {
      sessionID: ObjectId(id),
      currentStep: -1,
      status: "running",
      beginDate: new Date(),
    };

    const lastRun = await RunSchema.findOne({
      sessionID: ObjectId(run_info.sessionID),
    });

    if (lastRun) return res.status(200).json(lastRun);
    return res.status(200).json(null);
  } else if (action === "RELOAD_RUN") {
    let run_info = {
      sessionID: ObjectId(id),
      currentStep: -1,
      status: "running",
      beginDate: new Date(),
    };

    const lastRun = await RunSchema.findOne({
      sessionID: ObjectId(run_info.sessionID),
    });

    if (lastRun) return res.status(200).json(lastRun._id);
    else return res.status(200).json(null);
  } else if (action === "UPDATE_RUN") {
    const filter = { _id: ObjectId(id) };
    const update = { status: status };
    try {
      await RunSchema.updateOne(filter, update).exec();
      const run = await RunSchema.findOne({ _id: ObjectId(id) }).exec();
      return res.status(200).json(run);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msg: "Error updating run" });
    }
  } else if (action === "FINSIH_ALL_COURSE_RUNS") {
    const filter = { courseID: ObjectId(id) };
    const update = { status: "done" };

    try {
      await RunSchema.updateMany(filter, update);
      return res.status(200).json("ok");
    } catch (error) {
      return res.status(400).json({ msg: "Runs not found" });
    }
  } else if (action === "FINSIH_ALL_SESSION_RUNS") {
    //console.log('FINSIH_ALL_SESSION_RUNS:',id)
    const filter = { sessionID: ObjectId(id) };
    const update = { status: "done" };
    try {
      await RunSchema.updateMany(filter, update);
      return res.status(200).json("ok");
    } catch (error) {
      return res.status(400).json({ msg: "Runs not found" });
    }
  } else return res.status(400).json({ msg: "Error updating runs" });
});

router.post(`/learnersessionrun`, async (req, res) => {
  const { action, params } = req.body;

  if (action === "INIT_USER_SESSION") {
    const session_steps = await StepSchema.find({
      sessionID: ObjectId(params.sessionid),
    });

    let filter = { runID: params.runid, student: params.username };
    const existingLearnerSteps = await LearnerStepSchema.find(filter).exec();

    if (session_steps) {
      const promises = session_steps.map(async (step) => {
        let filter = {
          runID: params.runid,
          student: params.username,
          stepID: step._id,
        };
        const isExistingStep = existingLearnerSteps.some(
          (xstep) => String(xstep.stepID) === String(step._id)
        );

        if (isExistingStep) {
          const lstep = await LearnerStepSchema.findOne(filter);
          let stepStatus =
            lstep.status === "active" ? "inactive" : lstep.status;
          //await LearnerStepSchema.findOneAndUpdate(filter, {status: stepStatus}).exec();
        } else {
          const steprun_info = {
            runID: params.runid,
            student: params.username,
            stepID: step._id,
            order: step.order,
            title: step.title,
            status: "inactive",
            grade: null,
            beginDate: null,
            duration: null,
            difftime: null,
            locked: step.locked,
            synchro: step.synchro,
            sessionID: ObjectId(params.sessionid),
          };
          const theStepRun = new LearnerStepSchema(steprun_info);
          await theStepRun.save();
        }
      });

      await Promise.all(promises);

      const learnerSteps = await LearnerStepSchema.find({
        runID: params.runid,
        student: params.username,
        sessionID: params.sessionid,
      });
      await Promise.all(learnerSteps);

      if (learnerSteps) return res.status(200).json(learnerSteps);
    } else return res.status(200).json("ok");
  } else if (action === "GET_USER_SESSION") {
    const learnerSteps = await LearnerStepSchema.find({
      runID: params.runid,
      student: params.username,
      sessionID: params.sessionid,
    });
    await Promise.all(learnerSteps);
    if (learnerSteps) return res.status(200).json(learnerSteps);
    else return res.status(200).json([]);
  } else if (action === "SET_STEP_STATUS") {
    const filter = {
      _id: ObjectId(params.stepid),
    };

    const update = { status: params.status };
    const learnerSteps = await LearnerStepSchema.findOneAndUpdate(
      filter,
      update
    ).exec();
    
    if (learnerSteps) return res.status(200).json(learnerSteps);
    else return res.status(200).json([]);
  } else if (action === "SET_STEP_GRADE") {
    const filter = {
      _id: ObjectId(params.stepid),
    };
    const update = { grade: params.grade, difftime: params.difftime };
    const learnerSteps = await LearnerStepSchema.findOneAndUpdate(
      filter,
      update
    ).exec();
    if (learnerSteps) return res.status(200).json(learnerSteps);
    else return res.status(200).json([]);
  }else if (action === "SET_STEP_RATING") {
    const filter = {
      _id: ObjectId(params.stepid),
    };
    const update = { rating: params.rating };
    const learnerSteps = await LearnerStepSchema.findOneAndUpdate(
      filter,
      update
    ).exec();
    if (learnerSteps) return res.status(200).json(learnerSteps);
    else return res.status(200).json([]);
  } else if (action === "SET_STEP_DURATION") {
    const filter = {
      _id: ObjectId(params.stepid),
    };
    const update = { duration: params.duration };
    const learnerSteps = await LearnerStepSchema.findOneAndUpdate(
      filter,
      update
    ).exec();
    if (learnerSteps) return res.status(200).json(learnerSteps);
    else return res.status(200).json([]);
  } else if (action === "SET_STEP_LOCK") {
    const filter = {
      _id: ObjectId(params.stepid),
    };

    const update = { locked: params.locked };
    const learnerSteps = await LearnerStepSchema.findOneAndUpdate(
      filter,
      update
    ).exec();

    if (learnerSteps) return res.status(200).json(learnerSteps);
    else return res.status(200).json([]);
  } else return res.status(501).json({ msg: "error" });
});

router.post(`/steprun`, async (req, res) => {
  const { action, runid, username, stepid, order, title } = req.body;

  if (action === "INIT_STEP") {
    let filter = { runID: runid, student: username, stepID: stepid };
    let stepRun = await LearnerStepSchema.findOne(filter);
    let savedStepRunRes = null;
    if (stepRun) {
      let status = stepRun.status === "active" ? "inactive" : stepRun.status;

      savedStepRunRes = await LearnerStepSchema.updateOne(filter, {
        status: status,
      });
      if (savedStepRunRes) return res.status(200).json(savedStepRunRes);
      else return res.status(501).json({ msg: "error" });
    } else {
      let steprun_info = {
        runID: ObjectId(runid),
        student: username,
        stepID: ObjectId(stepid),
        order: order,
        title: title,
        status: "inactive",
        grade: null,
        beginDate: new Date(),
        duration: null,
      };
      stepRun = new LearnerStepSchema(steprun_info);
      savedStepRunRes = await stepRun.save();
      if (savedStepRunRes) return res.status(200).json(savedStepRunRes);
      else return res.status(501).json({ msg: "error" });
    }
  } else return res.status(501).json({ msg: "error" });
});
//

router.post(`/rungrades`, async (req, res) => {
  const { action, runid, username } = req.body;
  
  if (action === "COMPUTE_ALL_GRADES") {
    let students = await LearnerStepSchema.find({ runID: ObjectId(runid) }).distinct(
      "student"
    );

    for (i in students) {
      const student = students[i];
      let filter = { runID: runid, student: student };

      let studentSteps = await LearnerStepSchema.find(filter);
      if (studentSteps && studentSteps.length > 0) {
        let finishedSteps = studentSteps.filter(
          (step) => step.status == "done"
        );
        let grade = 100;
        const nFinished = finishedSteps.length;
        if (nFinished > 0) {
          const nSucess = finishedSteps.filter(
            (step) => step.grade == "success"
          ).length;
          grade = (nSucess * 100) / nFinished;
        }
      
        let runGrade = await RunGrades.findOne(filter);
        let savedRunGradeRes = null;
        if (runGrade) {
          savedRunGradeRes = await RunGrades.updateOne(filter, {
            grade: grade,
          });
         
        } else {
          let rungrade_info = {
            runID: ObjectId(runid),
            student: student,
            grade: grade,
          };
          runGrade = new RunGrades(rungrade_info);
          savedRunGradeRes = await runGrade.save();
        }
      }
      
    }
    return res.status(200).json('ok');
  } 
  else if (action === "GET_ALL_GRADES") {

    const grades = await RunGrades.find({runID: ObjectId(runid)})

    
    return res.status(200).json(grades);
  }
  else return res.status(501).json({ msg: "error" });
});

router.post(`/class`, async (req, res) => {
  const { action, runID } = req.body;

  if (action === "GET_LEARNERS_STEPS") {
    const learners = await LearnerStepSchema.find({
      runID: ObjectId(runID),
    });

    return res.status(200).json(learners);
  } else return res.status(501).json({ msg: "error" });
});

module.exports = router;
