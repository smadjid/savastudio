import { useContext, useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { UserContext } from "../../App";
import {
  getLearnerCourse,
  SetUserRunningCourse,
} from "../../services/CourseService";
import {
  getMyWaitingHelpRequest,
  getMyWaitingUnlockRequest,
} from "../../services/HelpService";
import { logout } from "../../services/LearnerService";
import { getLastActiveCourseRun } from "../../services/RunService";
import {
  getCourseSessions,
  getSession,
  getSessionSteps,
  interactStudentRun,
} from "../../services/SessionService";
import Swal from "sweetalert2";

import { LearnerSessionContext } from "./StudentBoard";
import { io } from "socket.io-client";

const LearnerSessionSelection = (props) => {
  const { show, toggleShow } = props;
  const { learnerContext, setLearnerContext } = useContext(
    LearnerSessionContext
  );

  const userContext = useContext(UserContext);

  const [learnerCourses, setLearnerCourses] = useState([]);
  const [courseRun, setCourseRun] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      if(socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchLearnerCourses();
  }, [learnerContext]);

  const fetchLearnerCourses = async () => {
    try {
      getLearnerCourse(learnerContext.student).then((courses) => {
        if (courses.length > 0) {
          setLearnerCourses(
            courses.map((c, index) => {
              const label = c.title;
              const value = index;
              const courseId = c._id;
              return { value, label, courseId };
            })
          );
        }
      });
    } catch (error) {
      console.log("error in fetching learner courses");
      return;
    }
  };

  const handleSelectCourse = (e) => {
    setSelectedCourse(e.label);
    getLastActiveCourseRun(e.courseId)
      .then((response) => {
        if (!response) return;
        let run = response[0];

        setCourseRun(run);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  

  const initStudentSession = () => {
    let currentStep = null;
    SetUserRunningCourse(courseRun.courseID)
      .then((response) => {
        if (response.status === 200) {
          const action = "INIT_USER_SESSION";
          const params = {
            runid: courseRun._id,
            username: learnerContext.student,
            sessionid: courseRun.sessionID,
          };
          interactStudentRun(action, params)
            .then((steps) => {
              currentStep = steps.filter(
                (step) => step.status === "active"
              )
              if(currentStep && currentStep.length>0) currentStep = currentStep[0]
              else currentStep = null
              getSessionSteps(courseRun.sessionID).then((stResponse) => {
                let sessSteps = [];
                if (stResponse && stResponse.length > 0) {
                  sessSteps = stResponse.sort(({ order: a }, { order: b }) => b - a);
                }
              getMyWaitingHelpRequest(
                learnerContext.student,
                courseRun._id
              ).then((hReq) => {
                getMyWaitingUnlockRequest(
                  learnerContext.student,
                  courseRun._id
                ).then((uReq) => {
                  let stepID = null;
                  let unlockID = null;

                  if (uReq) {
                    unlockID = uReq._id;
                    stepID = uReq.stStepID;
                  }
                  setLearnerContext((prevContext) => {
                    return {
                      ...prevContext,
                      studentSteps: steps,
                      currentStep: currentStep,
                      currentRun: courseRun,
                      classSteps: sessSteps,
                      waitingHRequest: hReq,
                      waitingURequest: {
                        stepID: stepID,
                        unlockID: unlockID,
                      },
                      session: courseRun.sessionID,
                    };
                  });
                  socket.emit("updated", courseRun._id);
                  return;
                });
                return;
              });
              return;

  });
  return;
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          Swal.fire({
            title: "Error",
            text: "Please select a course that is currently running, and continue",
            icon: "error",
            confirmButtonText: "Close",
          });
          return;
        }
      })
      .catch((err) => {
        Swal.fire({
          title: "Unknown Error",
          text: "There was an error connecting you to the course. Please try again later",
          icon: "error",
          confirmButtonText: "Close",
        });
        return;
      });
  };

  const onSubmit = (e) => {
    if (!courseRun) {
      Swal.fire({
        title: "Error",
        text: "Please select a course that is currently running, and continue",
        icon: "error",
        confirmButtonText: "Close",
      });

      return;
    }
    initStudentSession();

    

    getSession(courseRun.sessionID).then((response) => {
      props.startSession(selectedCourse, response.title);
    });
  };

  const onLogout = (e) => {
    logout(userContext)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        //setError("apiError", { message: error });
        console.log(error);
      });
    window.location.reload(false);
  };

  return (
    <Modal show={props.show} onHide={props.toggleShow}>
      <Modal.Header>
        <Modal.Title>Join a running course</Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>
              Select a course with currently running sessions
            </Form.Label>
            <Select options={learnerCourses} onChange={handleSelectCourse} />
            <hr />
            <Alert key={"secondary"} variant={"secondary"}>
              {" "}
              Your credentials will be verified before joining any selected
              course session.
            </Alert>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" data="yyyy" onClick={onSubmit}>
            Start
          </Button>
          <Button variant="danger" data="yyyy" onClick={onLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LearnerSessionSelection;
