const express = require("express");
const { ObjectId } = require("mongodb");
const Trouble = require("../models/TroubleSchema");
const LearnerStep = require("../models/LearnerStepSchema");
const router = express.Router();
router.get("/trouble", async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    console.log("No session associated to:", req.session.user);
    return res.status(401).json("unauthorize");
  }
});



router.post(`/trouble`, async (req, res) => {
  const { action, params } = req.body;
  if (action === "CREATE_TROUBLE") {
    let trouble_info = {
      runID: params.runID,
      student: params.student,
      stepID: params.stepID,
      stepOrder: params.stepOrder,
      status: params.status,
      type: params.type,
      date: params.date,
    };
    
    const newTrouble = new Trouble(trouble_info);
    
    const savedTroubleRes = await newTrouble.save();

    if (savedTroubleRes) return res.status(200).json(savedTroubleRes._id);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "GET_WAITING_TROUBLE") {
    let trouble_info = {
      runID: ObjectId(params.runID),
      student: params.student,
      status: "waiting",
    };
    const requests = await Trouble.find(trouble_info);
    let currRequest = requests && requests.length > 0 ? requests[0]._id : null;
    return res.status(200).json(currRequest);
  } else if (action === "CANCEL_TROUBLE") {
    const filter = {
      _id: ObjectId(params.troubleID),
    };
    const update = { status: "cancelled" };
    const cancelledTrouble = await Trouble.findOneAndUpdate(filter, update).exec();
    if (cancelledTrouble) return res.status(200).json(cancelledTrouble);
    else return res.status(500).json({ msg: "error" });
  } else if (action === "CHECK_TROUBLE_REQUEST") {
    const filter = {
      _id: ObjectId(params.troubleID),
    };

    const checkTrouble = await Trouble.find(filter);
    if (checkTrouble && checkTrouble.length > 0)
      return res.status(200).json(checkTrouble[0].status);

    return res.status(500).json({ msg: "error" });
  } else if (action === "ANSWER_TROUBLE_REQUEST") {
    const filter = {
      _id: ObjectId(params.troubleID),
    };
    const update = { status: "answered" };
    const cancelledTrouble = await Trouble.findOneAndUpdate(filter, update).exec();
    if (cancelledTrouble) return res.status(200).json(cancelledTrouble);
    else return res.status(500).json({ msg: "error" });
  } else return res.status(500).json({ msg: "error" });
});

router.get("/runtrouble/:runID", async (req, res) => {
  const runID = req.params.runID;
  const requests = await Trouble.find({ runID: ObjectId(runID) }).exec();
  return res.status(200).json(requests);
});



module.exports = router;
