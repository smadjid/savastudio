const { ObjectId } = require("mongodb");
const UserSchema = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const express = require("express");
const User = require("../models/UserSchema");
const router = express.Router();

router.post("/learner/register", async (req, res) => {
  const { username, email, password, profile } = req.body.learner;

  if (!username || !email || !password)
    return res
      .status(400)
      .json({ msg: "Username, password and email are required" });

  // if (password.length < 8) {
  //   return res
  //     .status(400)
  //     .json({ msg: 'Password should be at least 8 characters long' })
  // }

  const user = await UserSchema.findOne({ username });
  if (user) return res.status(400).json({ msg: "Username already exists" });

  const mail = await UserSchema.findOne({ email });
  if (mail)
    return res
      .status(400)
      .json({ msg: "Mail already used. Please connect with it" });

  const newUser = new UserSchema({ username, email, password, profile });
  bcrypt.hash(password, 7, async (err, hash) => {
    if (err)
      return res.status(400).json({ msg: "error while saving the password" });

    newUser.password = hash;
    const savedUserRes = await newUser.save();

    if (savedUserRes) return res.status(200).json({ msg: "ok" });
  });
});

router.get(`/runningcourse/:courseid`, async (req, res) => {
  if (req.session.user) {
    if (
      !req.params.courseid ||
      req.params.courseid == undefined ||
      req.params.courseid == "undefined" ||
      req.params.courseid == null ||
      req.params.courseid == "null"
    ) {
      User.findOneAndUpdate(
        { username: req.session.user.username },
        { runningCourseID: null }
      ).exec();
      return res.status(200).json(req.session.user);
    } else {
      if (req.session.user.profile === "learner") {
        ////////////// Learner connected
        let teacherSessions = [];
        req.sessionStore.all((err, sessions) => {
          if (sessions && sessions.length > 0) {
            teacherSessions = sessions.filter(
              (s) => s.session.user.profile === "teacher"
            );

            if (teacherSessions.length > 0) {
              teacherSessions = teacherSessions.map(
                (t) => t.session.user.username
              );
            } else teacherSessions = [];
          } else teacherSessions = [];
        });

        const courseTeacher = await User.find({
          profile: "teacher",
          runningCourseID: req.params.courseid,
        });

        if (
          courseTeacher &&
          courseTeacher.length > 0 &&
          teacherSessions.length > 0
        ) {
          if (teacherSessions.includes(courseTeacher[0].username)) {
            User.findOneAndUpdate(
              { username: req.session.user.username },
              { runningCourseID: ObjectId(req.params.courseid) }
            ).exec();
            return res.status(200).json(courseTeacher[0].username);
          } else {
            User.findOneAndUpdate(
              { username: req.session.user.username },
              { runningCourseID: null }
            ).exec();
            return res.status(403).json({ msg: "No teacher" });
          }
        } else return res.status(403).json({ msg: "No teacher" });
      } else {
        ////////////// Teacher connected

        const a = await User.find({ username: req.session.user.username });

        req.session.user.runningCourse = req.params.courseid;
        User.findOneAndUpdate(
          { username: req.session.user.username },
          { runningCourseID: ObjectId(req.params.courseid) }
        ).exec();

        return res.json(req.session.user);
      }
    }
  } else {
    console.log("No session associated to:", req.session.user);
    return res.status(403).json("unauthorize");
  }
});

router.get(`/connectedlearners/:courseid`, async (req, res) => {
  if (
    req.session.user &&
    req.params.courseid &&
    req.params.courseid != undefined &&
    req.params.courseid != "undefined" &&
    req.params.courseid != null &&
    req.params.courseid != "null"
  ) {
    let connectedLearners = [];
    let learnerSessions = [];

    let allLearners = await User.find({
      profile: "learner",
      runningCourseID: ObjectId(req.params.courseid),
    }).exec();
    
    if (allLearners && allLearners.length > 0) {
      allLearners = allLearners.map((l) => l.username);

      req.sessionStore.all((err, sessions) => {
        if (sessions && sessions.length > 0) {
          learnerSessions = sessions.filter(
            (s) => s.session.user.profile === "learner"
          );

          if (learnerSessions.length > 0) {
            learnerSessions = learnerSessions.map(
              (t) => t.session.user.username
            );
          } else learnerSessions = [];
          connectedLearners = allLearners.filter((l) =>
            learnerSessions.includes(l)
          );
          return res.status(200).json(connectedLearners);
        }
        else return res.status(200).json(connectedLearners);
      });
    } else return res.status(200).json(connectedLearners);
  } else return res.status(400).json({ msg: "error" });
});

router.post(`/login`, async (req, res) => {
  const { username, password } = req.body.learner;

  if (!username || !password) {
    res.status(400).json({ msg: "Something missing" });
  }

  const user = await UserSchema.findOne({ username: username }); // finding user in db
  if (!user) {
    return res.status(400).json({ msg: "User not found" });
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (matchPassword) {
    const userSession = {
      username: user.username,
      profile: user.profile,
      runningCourse: "empty",
    }; // creating user session to keep user loggedin also on refresh
    req.session.user = userSession; // attach user session to session object from express-session

    return res
      .status(200)
      .json({ msg: "You have logged in successfully", userSession }); // attach user session id to the response. It will be transfer in the cookies
  } else {
    return res.status(400).json({ msg: "Invalid credential" });
  }
});

router.delete(`/logout`, async (req, res) => {
  req.session.destroy((error) => {
    if (error) throw error;

    res.clearCookie("session-id"); // cleaning the cookies from the user session
    res.status(200).send("Logout Success");
  });
});

router.get("/isAuth", async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    console.log("No session associated to:", req.session.user);
    return res.status(401).json("unauthorize");
  }
});

module.exports = router;
