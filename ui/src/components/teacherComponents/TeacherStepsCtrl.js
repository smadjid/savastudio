import {
  faBookmark,
  faChalkboardTeacher,
  faCheck,
  faClockFour,
  faHourglass,
  faLock,
  faRepeat,
  faRotateBack,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { Badge, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { getAllSteps, interactSession } from "../../services/SessionService";
import "./TeacherStepsCtrl.css";
import { TeacherContext } from "./TeacherHome";
import Timer from "../../services/Timer";
import moment from "moment";
import { computeRunGrades, interactRun } from "../../services/RunService";
import Swal from "sweetalert2";

import io from "socket.io-client";

const delay = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const TeacherStepsCtrl = (props) => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [selectedSessionSteps, setSelectedSessionSteps] = useState([]);
  const [currentStepDuration, setCurrentStepDuration] = useState();

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerValue, setTimerValue] = useState(0);

  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      teacherContext &&
      teacherContext.currentRun &&
      existsActiveStep() &&
      !timerRunning
    ) {
      let currentStep = getActiveStep();
      setTimerRunning(true);
      startClockWatch(currentStep.duration);
      setCurrentStepDuration(currentStep.expDuration);
    }
  }, [teacherContext.currentRun]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (
  //       teacherContext &&
  //       teacherContext.currentRun &&
  //       existsActiveStep() &&
  //       timerRunning
  //     ) {
  //       let currentStep = getActiveStep();
  //       const dur = getClockWatchValue();
  //       saveStepDuration(currentStep._id, dur);
  //     }
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, [timerRunning]);


  useEffect(() => {
    const handleTabClose = event => {
      event.preventDefault();

      console.log('beforeunload event triggered');
      if (
        teacherContext &&
        teacherContext.currentRun &&
        existsActiveStep() &&
        timerRunning
      ) {
        let currentStep = getActiveStep();
        const dur = getClockWatchValue();
        saveStepDuration(currentStep._id, dur);
      }
      event.stopImmediatePropagation();
      event.stopPropagation();

      return (event.returnValue = 'Are you sure you want to exit?');
    };

//    window.addEventListener('beforeunload',  handleTabClose);
    window.addEventListener('beforeunload', function (event) {
      handleTabClose(event)
     // interactRun("UPDATE_RUN", teacherContext.currentRun, "paused");
    });

    
    

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, [timerRunning, timerValue]);


  const existsActiveStep = () => {
    if (teacherContext.steps)
      return teacherContext.steps.some((step) => step.status === "active");
    else return false;
  };

  const reachedLastStep = () => {
    if(!teacherContext.steps)
      return true;
    let followingSteps = teacherContext.steps.filter(
      (step) => step.status === "inactive"
    );

    return !(followingSteps && followingSteps.length > 0);
  };

  const getActiveStep = () => {
    if (!teacherContext.steps) return null;
    let step = teacherContext.steps.filter((step) => step.status === "active");
    return step[0];
  };

  const getLastDoneStep = () => {
    let lastDones = teacherContext.steps.filter(
      (step) => step.status === "done"
    );

    if (lastDones.length > 0) {
      const lastStepOrder = lastDones.reduce(function (prev, current) {
        return prev.order > current.order ? prev : current;
      });
      return lastStepOrder;

      // let nextStep = teacherContext.steps.filter(
      //   (step) => step.order === lastStepOrder.order + 1
      // );
      // if (nextStep) {
      //   setStepStatus(nextStep[0]._id, "active");
      //   setLearnerActiveStep(nextStep[0]);
      // }
    } else return null;
  };

  const getClockWatchValue = () => {
    return timerValue;
  };

  const stopClockWatch = () => {
    setTimerRunning(false);
  };

  const startClockWatch = (t) => {
    t = t ? t * 1000 : 0;
    setTimerValue(t);
    setTimerRunning(true);
  };

  const saveStepDuration = (stepId, duration) => {
    const action = "SET_STEP_DURATION";
    let params = {
      action: "SET_STEP_DURATION",
      stepid: stepId,
      duration: Math.floor(duration / 1000),
    };
    interactSession(action, params);
  };

  const startRun = () => {
    interactRun("UPDATE_RUN", teacherContext.currentRun, "running");
    socket.emit("updated", teacherContext.currentRun);
  };

  const handleStartSession = () => {
    if (reachedLastStep())
      return Swal.fire({
        title: "No more step",
        text: "You reached the last step of the session! If you want to replay or continue any step, please use its resume button",
        icon: "error",
        confirmButtonText: "Close",
      });
    const lastDoneStep = getLastDoneStep();

    if (lastDoneStep) {
      let nextStep = teacherContext.steps.filter(
        (step) => step.order === lastDoneStep.order + 1
      );
      if (nextStep) {
        let params = {
          action: "SET_STEP_STATUS",
          stepid: nextStep[0]._id,
          status: "active",
        };
        if (!existsActiveStep())
          interactSession(teacherContext.session, params);
      }
    } else {
      let params = {
        action: "SET_STEP_STATUS",
        stepid: teacherContext.steps[0]._id,
        status: "active",
      };

      if (!existsActiveStep()) interactSession(teacherContext.session, params);
      startRun();
    }

    startRun();
    socket.emit("updated", teacherContext.currentRun);

    startClockWatch();
  };

  const handleStopStep = () => {
    // Swal.fire({
    //   title: "Go the next step !",
    //   text: "This action will stop the current. Please confirm this action!",
    //   icon: "warning",
    //   confirmButtonText: "Confirm",
    //   cancelButtonText: "Cancel",
    //   showDenyButton: false,
    //   showCancelButton: true,
    // }).then((result) => {
    //   if (result.isConfirmed) {}
    // })
    Swal.fire({
      title: "End the step?",
      text: "This action will end the current step. Please confirm this action!",
      icon: "warning",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      showDenyButton: false,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        let currentStep = getActiveStep();
        if (!currentStep) return null;

        const dur = getClockWatchValue();

        stopClockWatch();

        saveStepDuration(currentStep._id, dur);

        computeGrade(currentStep._id);

        let params = {
          action: "SET_STEP_STATUS",
          stepid: currentStep._id,
          status: "done",
        };

        interactSession(teacherContext.session, params);
        setCurrentStepDuration(null);
        socket.emit("updated", teacherContext.currentRun);
      }
    });
  };

  const handleNextStep = () => {
    Swal.fire({
      title: "End this step?",
      text: "This action will stop the current step. Please confirm this action!",
      icon: "warning",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      showDenyButton: false,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        let currentStep = getActiveStep();
        if (!currentStep) return null;

        const dur = getClockWatchValue();

        stopClockWatch();

        saveStepDuration(currentStep._id, dur);

        computeGrade(currentStep._id);
        computeRunGrades(teacherContext.currentRun);

        let params = {
          action: "SET_STEP_STATUS",
          stepid: currentStep._id,
          status: "done",
        };

        interactSession(teacherContext.session, params);
        setCurrentStepDuration(null);

        if (reachedLastStep()) {
           Swal.fire({
            title: "No more step",
            text: "You reached the last step of the sessions!",
            icon: "error",
            confirmButtonText: "Close",
          });
          return socket.emit("updated", teacherContext.currentRun);
        }

        let nextStep = teacherContext.steps.filter(
          (step) => step.order === currentStep.order + 1
        );
        nextStep = nextStep[0];
        params = {
          action: "SET_STEP_STATUS",
          stepid: nextStep._id,
          status: "active",
        };
        interactSession(teacherContext.session, params)
          .then((response) => {
            startClockWatch();
            setCurrentStepDuration(nextStep.expDuration);
          })
          .catch((error) => {
            console.log(error);
          });
        socket.emit("updated", teacherContext.currentRun);
      }
    });
  };

  const handleGotoStep = (stepid, continue_run) => {
    let currentStep = getActiveStep();
    if (currentStep) {
      const dur = getClockWatchValue();
      stopClockWatch();
      saveStepDuration(currentStep._id, dur);

      computeGrade(currentStep._id);
      let params = {
        action: "SET_STEP_STATUS",
        stepid: currentStep._id,
        status: "done",
      };

      interactSession(teacherContext.session, params);
      setCurrentStepDuration(null);
    }

    let gotoStep = teacherContext.steps.filter((step) => step._id === stepid);
    gotoStep = gotoStep[0];
    let params = {
      action: "SET_STEP_STATUS",
      stepid: stepid,
      status: "active",
    };
    const begin_time = continue_run ? gotoStep.duration : 0;

    interactSession(teacherContext.session, params)
      .then((response) => {
        startClockWatch(begin_time);
        setCurrentStepDuration(gotoStep.expDuration);
      })
      .catch((error) => {
        console.log(error);
      });
    socket.emit("updated", teacherContext.currentRun);
  };

  const computeGrade = async (stepId) => {
    await delay(5);

    const grades = ["success", "warning", "issue"];
    var grade = grades[Math.floor(Math.random() * grades.length)];
    let params = {
      action: "SET_STEP_GRADE",
      stepid: stepId,
      grade: grade,
    };
    interactSession(teacherContext.session, params);
    //socket.emit("updated", teacherContext.currentRun);
  };

  const repeatStep = (stepId) => {
    Swal.fire({
      title: "Activate this step !",
      text: "If you want to go to this step, please select how you want to run again it",
      icon: "warning",
      confirmButtonText: "Continue the step",
      denyButtonText: "Restart from beginning",
      cancelButtonText: "Cancel",
      showDenyButton: true,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleGotoStep(stepId, true);
        //socket.emit("updated", teacherContext.currentRun);
      } else if (result.isDenied) {
        handleGotoStep(stepId, false);
        //socket.emit("updated", teacherContext.currentRun);
      }
    });
  };

  return (
    <div className="row">
      <div className="card text-dark mb-3 p-0">
        <div className="card-header bg-dark text-white">Steps control</div>
        <div className="card-body" style={{backgroundColor:'#F8FAFC'}}>
          <div className="w-100 d-flex justify-content-center">
            <div className="btn-group m-1">
              {!existsActiveStep() && (
                <Button
                  className="btn btn-success"
                  onClick={handleStartSession}
                  disabled={reachedLastStep()}
                >
                  Start/resume the session
                </Button>
              )}
              {/* {existsActiveStep() && (
                <Button className="btn btn-info" onClick={handlePreviousStep}>
                  Previous
                </Button>
              )} */}
              &nbsp;
              {existsActiveStep() && !reachedLastStep() && (
                <Button className="btn btn-danger" onClick={handleStopStep}>
                  Stop
                </Button>
              )}
              &nbsp;
              {existsActiveStep() && (
                <Button className="btn btn-primary" onClick={handleNextStep}>
                  {!reachedLastStep() && "Next"}
                  {reachedLastStep() && "End Session"}
                </Button>
              )}
            </div>
          </div>

          <div className="container-fluid table-responsive">
            <table className="table steps-control-table   m-0">
              <tr>
                {teacherContext.steps &&
                  teacherContext.steps
                    .sort((a, b) => (a.order > b.order ? 1 : -1))
                    .map((step) => {
                      return <td></td>;
                    })}
              </tr>

              <tbody>
                <tr>
                  {teacherContext.steps &&
                    teacherContext.steps
                      .sort((a, b) => (a.order > b.order ? 1 : -1))
                      .map((step) => {
                        let step_students = [];
                        if (teacherContext.learnersSteps)
                          step_students = teacherContext.learnersSteps.filter(
                            (st) => {
                              return (
                                st.status === "active" && st.stepID === step._id
                              );
                            }
                          );
                        let nb_step_students = step_students.length;
                        if (step.status === "done")
                          return (
                            <td className={`step step_tmp`}>
                              <div className="d-flex justify-content-between ">
                                <div>
                                  {/* Step {step.order} */}
                                  <Badge bg="dark">{step.order}</Badge>{" "}
                                  {step.title}{" "}
                                  <FontAwesomeIcon
                                    icon={faRotateBack}
                                    role="button"
                                    onClick={() => repeatStep(step._id)}
                                  />
                                  <br />
                                  {step.synchro && (
                                    <FontAwesomeIcon icon={faBookmark} />
                                  )}{" "}
                                  &nbsp;
                                  {step.locked && (
                                    <FontAwesomeIcon icon={faLock} />
                                  )}
                                </div>
                                <OverlayTrigger
                                  trigger={["hover", "focus"]}
                                  placement="bottom"
                                  delay={{ show: 250, hide: 400 }}
                                  overlay=<Popover>
                                    <Popover.Header as="h3">
                                      Students at step {step.order}
                                    </Popover.Header>
                                    <Popover.Body>
                                      {nb_step_students > 0 ? (
                                        <ul>
                                          {step_students.map((st) => (
                                            <li>{st.student}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        "No student at this step"
                                      )}
                                    </Popover.Body>
                                  </Popover>
                                >
                                  <Button variant="outline-danger" size="sm">
                                    <FontAwesomeIcon icon={faUserGraduate} />{" "}
                                    {nb_step_students}
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </td>
                          );
                        else if (step.status === "active")
                          return (
                            <td className={`step ${step.status}`}>
                              <div className="d-flex justify-content-between">
                                <div>
                                  {" "}
                                  <span className="spinner-grow">
                                    <b className="text-dark">{step.order}</b>
                                  </span>
                                  &nbsp; {step.title}
                                  {/* <Badge  bg="light" className="text-dark">{step.order}</Badge>{" "}{step.title} */}
                                  <br />
                                  {/* <FontAwesomeIcon icon={faLock} /> */}
                                  {step.synchro && (
                                    <FontAwesomeIcon icon={faBookmark} />
                                  )}
                                </div>
                                <div>
                                  <OverlayTrigger
                                    trigger={["hover", "focus"]}
                                    placement="bottom"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay=<Popover>
                                      <Popover.Header as="h3">
                                        Students at step {step.order}
                                      </Popover.Header>
                                      <Popover.Body>
                                        {nb_step_students > 0 ? (
                                          <ul>
                                            {step_students.map((st) => (
                                              <li>{st.student}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          "No student at this step"
                                        )}
                                      </Popover.Body>
                                    </Popover>
                                  >
                                    <Button variant="outline-light" size="sm">
                                      <FontAwesomeIcon icon={faUserGraduate} />{" "}
                                      {nb_step_students}
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </div>
                            </td>
                          );
                        else
                          return (
                            <td className={`step ${step.status}`}>
                              <div className="d-flex justify-content-between">
                                <div>
                                  {/* Step {step.order} */}
                                  <Badge bg="dark">{step.order}</Badge>{" "}
                                  {step.title}
                                  <br />
                                  {/* <FontAwesomeIcon icon={faLock} /> */}
                                  {step.synchro && (
                                    <FontAwesomeIcon icon={faBookmark} />
                                  )}
                                </div>
                                <div>
                                  <OverlayTrigger
                                    trigger={["hover", "focus"]}
                                    placement="bottom"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay=<Popover>
                                      <Popover.Header as="h3">
                                        Students at step {step.order}
                                      </Popover.Header>
                                      <Popover.Body>
                                        {nb_step_students > 0 ? (
                                          <ul>
                                            {step_students.map((st) => (
                                              <li>{st.student}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          "No student at this step"
                                        )}
                                      </Popover.Body>
                                    </Popover>
                                  >
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                    >
                                      <FontAwesomeIcon icon={faUserGraduate} />{" "}
                                      {nb_step_students}
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </div>
                            </td>
                          );
                      })}
                </tr>
                <tr>
                  {teacherContext.steps &&
                    teacherContext.steps
                      .sort((a, b) => (a.order > b.order ? 1 : -1))
                      .map((step) => {
                        return (
                          <td>
                            {step.status === "done" && (
                              <div className="badge bg-secondary">
                                <FontAwesomeIcon icon={faCheck} /> &nbsp;{" "}
                                {moment(step.duration * 1000).format("mm:ss")} /{" "}
                                {step.expDuration && step.expDuration
                                  ? moment(step.expDuration * 60000).format(
                                      "mm:ss"
                                    )
                                  : "--:--"}
                              </div>
                            )}
                            {step.status === "inactive" && (
                              <>
                                {step.expDuration && step.expDuration > 0 ? (
                                  <div className="badge bg-info">
                                    <FontAwesomeIcon icon={faHourglass} />{" "}
                                    &nbsp;{" "}
                                    {moment(step.expDuration * 60000).format(
                                      "mm:ss"
                                    )}
                                  </div>
                                ) : (
                                  " "
                                )}
                              </>
                            )}
                            {step.status === "active" && (
                              <>
                                <>
                                  {step.expDuration && step.expDuration > 0 ? (
                                    <div className="badge bg-info">
                                      <FontAwesomeIcon icon={faHourglass} />{" "}
                                      &nbsp;{" "}
                                      {moment(step.expDuration * 60000).format(
                                        "mm:ss"
                                      )}
                                    </div>
                                  ) : (
                                    " "
                                  )}
                                </>
                                <br />
                                {!currentStepDuration ||
                                currentStepDuration === 0 ||
                                currentStepDuration * 60 * 1000 > timerValue ? (
                                  <label className="bg-dark border position-relative text-white time-elapsed p-2">
                                    <span>
                                      <FontAwesomeIcon icon={faClockFour} />{" "}
                                      &nbsp;
                                    </span>
                                    <Timer
                                      time={timerValue}
                                      setTime={setTimerValue}
                                      running={timerRunning}
                                      setRunning={setTimerRunning}
                                      currentStepDuration={currentStepDuration}
                                    />
                                  </label>
                                ) : (
                                  <label className="bg-danger border position-relative text-white time-elapsed p-2">
                                    <span>
                                      <FontAwesomeIcon icon={faClockFour} />{" "}
                                      &nbsp;
                                    </span>
                                    <Timer
                                      time={timerValue}
                                      setTime={setTimerValue}
                                      running={timerRunning}
                                      setRunning={setTimerRunning}
                                      currentStepDuration={currentStepDuration}
                                    />
                                  </label>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStepsCtrl;
