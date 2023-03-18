const express = require("express");
const { ObjectId } = require("mongodb");
const Help = require("../models/HelpSchema");
const Unlock = require("../models/UnlockRequestSchema");
const LearnerStep = require("../models/LearnerStepSchema");
const router = express.Router();
router.get("/help", async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    console.log("No session associated to:", req.session.user);
    return res.status(401).json("unauthorize");
  }
});

router.get("/unlock", async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    console.log("No session associated to:", req.session.user);
    return res.status(401).json("unauthorize");
  }
});

router.post(`/help`, async (req, res) => {
  const { action, params } = req.body;
  if (action === "CREATE_HELP_REQUEST") {
    let help_info = {
      runID: params.runID,
      student: params.student,
      stepID: params.stepID,
      stepOrder: params.stepOrder,
      status: params.status,
      date: params.date,
    };
    
    const newHelp = new Help(help_info);
    
    const savedHelpRes = await newHelp.save();

    if (savedHelpRes) return res.status(200).json(savedHelpRes._id);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "GET_MY_WAITING_HELP_REQUEST") {
    let help_info = {
      runID: ObjectId(params.runID),
      student: params.student,
      status: "waiting",
    };
    const requests = await Help.find(help_info);
    let currRequest = requests && requests.length > 0 ? requests[0]._id : null;
    return res.status(200).json(currRequest);
  } else if (action === "CANCEL_HELP_REQUEST") {
    const filter = {
      _id: ObjectId(params.helpID),
    };
    const update = { status: "cancelled" };
    const cancelledHelp = await Help.findOneAndUpdate(filter, update).exec();
    if (cancelledHelp) return res.status(200).json(cancelledHelp);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "CHECK_HELP_REQUEST") {
    const filter = {
      _id: ObjectId(params.helpID),
    };

    const checkHelp = await Help.find(filter);
    if (checkHelp && checkHelp.length > 0)
      return res.status(200).json(checkHelp[0].status);

    return res.status(500).json({ msg: "error" });
  } else if (action === "ANSWER_HELP_REQUEST") {
    const filter = {
      _id: ObjectId(params.helpID),
    };
    const update = { status: "answered" };
    const cancelledHelp = await Help.findOneAndUpdate(filter, update).exec();
    var io = req.app.get('socketio');
    io.emit('help_answered', params.helpID);
    if (cancelledHelp) return res.status(200).json(cancelledHelp);
    else return res.status(500).json({ msg: "error" });
  } else 
  if (action === "RATE_HELP_REQUEST") {
    const filter = {
      _id: ObjectId(params.helpID),
    };
    const update = { rating: params.rating };
    const cancelledHelp = await Help.findOneAndUpdate(filter, update).exec();
    var io = req.app.get('socketio');
    io.emit('help_answered', params.helpID);
    if (cancelledHelp) return res.status(200).json(cancelledHelp);
    else return res.status(500).json({ msg: "error" });
  } else return res.status(500).json({ msg: "error" });
});

router.get("/runhelp/:runID", async (req, res) => {
  const runID = req.params.runID;
  const requests = await Help.find({ runID: ObjectId(runID) }).exec();
  return res.status(200).json(requests);
});

router.get("/rununlock/:runID", async (req, res) => {
  const runID = req.params.runID;
  const requests = await Unlock.find({ runID: ObjectId(runID) }).exec();
  return res.status(200).json(requests);
});

router.post(`/unlock`, async (req, res) => {
  const { action, params } = req.body;
  if (action === "CREATE_UNLOCK_REQUEST") {
    let unlock_info = {
      runID: params.runID,
      student: params.student,
      stepID: params.stepID,
      stepOrder: params.stepOrder,
      stStepID: params.stStepID,
      status: params.status,
      date: params.date,
    };
    
    const newUnlock = new Unlock(unlock_info);
    
    const savedUnlockRes = await newUnlock.save();

    if (savedUnlockRes) return res.status(200).json(savedUnlockRes._id);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "GET_MY_WAITING_UNLOCK_REQUEST") {
    let help_info = {
      runID: ObjectId(params.runID),
      student: params.student,
      status: "waiting",
    };
    const requests = await Unlock.find(help_info);
    let requestId = null;
    let stStepID = null;
    if (requests && requests.length > 0) {
      return res.status(200).json(requests[0]);
    } else return res.status(200).json(null);
  } else if (action === "CANCEL_UNLOCK_REQUEST") {
    const filter = {
      _id: ObjectId(params.unlockID),
    };
    const update = { status: "cancelled" };
    const cancelledUnlock = await Unlock.findOneAndUpdate(
      filter,
      update
    ).exec();
    if (cancelledUnlock) return res.status(200).json(cancelledUnlock);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "CHECK_UNLOCK_REQUEST") {
    const filter = {
      _id: ObjectId(params.unlockID),
    };
    const checkUnlock = await Unlock.find(filter);
    if (checkUnlock && checkUnlock.length > 0)
      return res.status(200).json(checkUnlock[0].status);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "ANSWER_UNLOCK_REQUEST") {
    const filter = {
      _id: ObjectId(params.unlockID),
    };
    const update = { status: params.status };
    const answeredUnlock = await Unlock.findOneAndUpdate(filter, update).exec();
    if (answeredUnlock) {
      if (params.status === "accepted") {
        const stepFilter = { _id: ObjectId(answeredUnlock.stStepID) };
        const stepUpdate = { locked: false };
        await LearnerStep.findOneAndUpdate(stepFilter, stepUpdate).exec();
        var io = req.app.get('socketio');
        io.emit('unlock_accepted', params.unlockID);
      }
      return res.status(200).json(answeredUnlock);
    } else return res.status(500).json({ msg: "error" });
  } else return res.status(500).json({ msg: "error" });
});

module.exports = router;
