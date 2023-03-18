import {
  faBookmark,
  faCheck,
  faClockFour,
  faExclamationCircle,
  faLock,
  faPauseCircle,
  faPersonChalkboard,
  faRotateBack,
  faUnlock,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useState, useContext, useEffect } from "react";
import { Badge, Row } from "react-bootstrap";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import { Rating } from "react-simple-star-rating";
import {
  cancelUnlockRequest,
  checkUnlockRequest,
  createUnlockRequest,
} from "../../services/HelpService";
import { interactStudentRun } from "../../services/SessionService";
import Timer from "../../services/Timer";

import { LearnerSessionContext } from "./StudentBoard";

import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

//const ENDPOINT = configs.SOCKET_IO_ENDPOINT;
const socket = io();
const LearnerStepsCtrl = (props) => {
  const { learnerContext, setLearnerContext } = useContext(
    LearnerSessionContext
  );

  const [show, setShow] = useState(true);
  //const [classActiveStep, setClassActiveStep] = useState(null);
  const [timerRunning, setTimerRunning] = useState();
  // const [currentUnlockAsking, setCurrentUnlockAsking] = useState({
  //   stepID: null,
  //   unlockID: null,
  // });

  const [timerValue, setTimerValue] = useState(0);

  // useEffect(() => {
  //   //updateContext();
  //   if (learnerContext.currentStep) {
  //     if (!timerRunning)
  //       setTimeout(startClockWatch(learnerContext.currentStep.duration), 10000);
  //     const dur = getClockWatchValue();
  //     saveStepDuration(learnerContext.currentStep._id, dur);
  //   }
  // }, [learnerContext]);

  useEffect(() => {
    if (
      learnerContext &&
      learnerContext.currentRun &&
      learnerContext.currentStep &&
      !timerRunning
    ) {
      setTimerRunning(true);
      startClockWatch(learnerContext.currentStep.duration);
    }
  }, [learnerContext.currentRun]);

  // useEffect(() => {
  //     if (
  //       learnerContext &&
  //       learnerContext.currentRun &&
  //       learnerContext.currentStep &&
  //       timerRunning
  //     ) {
  //       console.log('save', learnerContext.currentStep._id, timerValue)
  //       saveStepDuration(learnerContext.currentStep._id, timerValue);
  //     }
  //     else{
  //       console.log(
  //         timerValue
  //       )
  //     }
  // }, [timerValue]);

  useEffect(() => {
    const handleTabClose = (event) => {
      event.preventDefault();

      if (
        learnerContext &&
        learnerContext.currentRun &&
        learnerContext.currentStep &&
        timerRunning
      ) {
        saveStepDuration(learnerContext.currentStep._id, timerValue);
      }

      return (event.returnValue = "Are you sure you want to exit?");
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [timerRunning, timerValue]);

  // useEffect(() => {
  //   console.log("update");
  //   const interval = setInterval(() => {
  //     if (learnerContext && learnerContext.currentRun) {
  //       updateContext();
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  // const setLearnerActiveStep = (step) => {
  //   let currStep = null;
  //   let newStep = null;
  //   if (learnerContext.currentStep) currStep = learnerContext.currentStep;
  //   if (step) newStep = step._id;

  //   if (newStep !== currStep) {
  //     //console.log("need update");
  //     setLearnerContext((prevContext) => {
  //       return {
  //         ...prevContext,
  //         currentStep: step._id,
  //       };
  //     });
  //   }
  // };
  const existsActiveStep = () => {
    if (learnerContext.steps)
      return learnerContext.steps.some((step) => step.status === "active");
    else return false;
  };

  const reachedLastStep = () => {
    let followingSteps = learnerContext.studentSteps.filter(
      (step) => step.status === "inactive"
    );

    return !(followingSteps && followingSteps.length > 0);

    // return (
    //   learnerContext.studentSteps &&
    //   getActiveStep().order >= learnerContext.studentSteps.length
    // );
  };

  const getClockWatchValue = () => {
    return timerValue;
  };

  const stopClockWatch = () => {
    setTimerRunning(false);
  };

  const startClockWatch = (t) => {
    setTimerRunning(true);
    t = t ? t * 1000 : 0;
    setTimerValue(t);
  };

  const updateContext = () => {
    ////// get current step
    // if (!learnerContext.classSteps) setClassActiveStep(null);
    // else {
    //   let step = learnerContext.classSteps.filter(
    //     (step) => step.status === "active"
    //   );
    //   if (step) setClassActiveStep(step[0]);
    //   else setClassActiveStep(null);
    // }
    // if (!learnerContext.studentSteps) setLearnerActiveStep(null);
    // else {
    //   let lstep = getActiveStep();
    //   // console.log(lstep);
    //   if (lstep) setLearnerActiveStep(lstep);
    //   else setLearnerActiveStep(null);
    // }
    // if (!sessionIsRunning()) setLearnerActiveStep(null);
    // if (learnerContext.waitingURequest.unlockID) {
    //   const params = {
    //     action: "CHECK_HELP_REQUEST",
    //     unlockID: learnerContext.waitingURequest.unlockID,
    //   };
    //   checkUnlockRequest(params)
    //     .then((response) => {
    //       if (response !== "waiting") {
    //         props.setShowNotification(true);
    //         props.setNotificationContent("Teacher has responded to your unlock request")
    //         setWaitingUnlock(null, null);
    //       }
    //     })
    //     .catch((e) => console.log("Error checking help request"));
    // }
    // if (learnerContext.currentStep) {
    //   if (!timerRunning)
    //     setTimeout(startClockWatch(learnerContext.currentStep.duration), 10000);
    //   const dur = getClockWatchValue();
    //   saveStepDuration(learnerContext.currentStep._id, dur);
    // }
  };

  const saveStepDuration = (stepId, duration) => {
    const action = "SET_STEP_DURATION";
    let params = {
      action: "SET_STEP_DURATION",
      stepid: stepId,
      duration: Math.floor(duration / 1000),
    };
    interactStudentRun(action, params);
  };

  const computeActiveStepGrade = (issue) => {
    //console.log(lstep.duration, duration)
    //return;
    let grade = "success";
    let difft = 0;
    // var grade = grades[Math.floor(Math.random() * grades.length)];

    // if (
    //   !(learnerContext.studentSteps && learnerContext.studentSteps.length > 0)
    // )
    //   return null;

    // let lstep = learnerContext.studentSteps.filter(
    //   (step) => step.status === "active"
    // );

    // if (!lstep) return null;

    // lstep = lstep[0];

    if (!learnerContext.currentStep) return null;

    let cstep = null;
    if (learnerContext.classSteps) {
      let step = learnerContext.classSteps.filter(
        (step) => step._id === learnerContext.currentStep.stepID
      );
      if (step) cstep = step[0];
    }

    if (issue) grade = "issue";
    else if (cstep.status === "active") grade = "success";
    else if (cstep.status === "done")
      if (
        Math.floor(learnerContext.currentStep.duration / 60) >
        Math.floor(cstep.duration / 60)
      ) {
        grade = "warning";
        difft =
          Math.floor(learnerContext.currentStep.duration / 60) -
          Math.floor(cstep.duration / 60);
      }


    ////////////////////////////////////////////////

    const action = "SET_STEP_GRADE";
    let params = {
      action: "SET_STEP_GRADE",
      stepid: learnerContext.currentStep._id,
      grade: grade,
      difftime: difft,
    };
    // console.log( 'stepid', learnerContext.currentStep._id, ' grade:', grade,' difftime:', difft)
    interactStudentRun(action, params);

    //socket.emit("updated", learnerContext.currentRun._id);
  };

  const setStepStatus = (id, status) => {
    setShow(false);
    const action = "SET_STEP_STATUS";
    const params = {
      action: "SET_STEP_STATUS",
      stepid: id,
      status: status,
      locked: true,
    };
    interactStudentRun(action, params)
      .then((response) => {
        setShow(true);
      })
      .catch((error) => {
        console.log(error);
      });

    //socket.emit("updated", learnerContext.currentRun._id);
  };

  const setStepRating = (id, rating) => {
    setShow(false);
    const action = "SET_STEP_RATING";
    const params = {
      action: "SET_STEP_RATING",
      stepid: id,
      rating: rating,
    };
    interactStudentRun(action, params)
      .then((response) => {
        setShow(true);
      })
      .catch((error) => {
        console.log(error);
      });

    //socket.emit("updated", learnerContext.currentRun._id);
  };

  const setStepLock = (id, locked) => {
    setShow(false);

    const action = "SET_STEP_LOCK";
    const params = {
      action: "SET_STEP_LOCK",
      stepid: id,
      locked: locked,
    };
    interactStudentRun(action, params)
      .then((response) => {
        setShow(true);
      })
      .catch((error) => {
        console.log(error);
      });

    //socket.emit("updated", learnerContext.currentRun._id);
  };

  const setWaitingUnlock = (stepid, uid) => {
    setLearnerContext((prevContext) => {
      return {
        ...prevContext,
        waitingURequest: {
          stepID: stepid,
          unlockID: uid,
        },
      };
    });
  };

  const handleFinishStep = (aborted) => {
    let ratingValue = aborted ? 1 : 3;
    let title = aborted
      ? "Sure you want to abort?"
      : "How was your learning at this step?";
    const html = (
      <>
        {" "}
        This action will stop the current step. Indicate your level of
        understanding <br />
        <Rating
          fillColorArray={[
            "#f14f45",
            "#f16c45",
            "#f18845",
            "#f1b345",
            "#f1d045",
          ]}
          onClick={(r) => {
            ratingValue = r;
          }}
          // customIcons={[
          //   {
          //     icon: <FontAwesomeIcon icon={faBookmark} />,
          //   },
          //   {
          //     icon: <FontAwesomeIcon icon={faBookmark} />,
          //   },
          //   {
          //     icon: <FontAwesomeIcon icon={faBookmark} />,
          //   },
          //   {
          //     icon:<FontAwesomeIcon icon={faBookmark} />,
          //   },
          //   {
          //     icon: <FontAwesomeIcon icon={faBookmark} />,
          //   },
          // ]}
          initialValue={ratingValue}
        />
      </>
    );
    const abortHtml = (
      <>
        {" "}
        Are you sure that you want to abort this step? We will report an issue
        related to your understanding if this step
        <br />
        <Rating
          readonly
          fillColorArray={[
            "#f14f45",
            "#f16c45",
            "#f18845",
            "#f1b345",
            "#f1d045",
          ]}
          onClick={(r) => {
            ratingValue = r;
          }}
          initialValue={ratingValue}
        />
      </>
    );

    MySwal.fire({
      title: title,
      icon: aborted ? "error" : "question",
      confirmButtonText: "Finish the step",
      cancelButtonText: "Cancel",
      showDenyButton: false,
      showCancelButton: true,
      html: aborted ? abortHtml : html,
      didOpen: () => {
        // `MySwal` is a subclass of `Swal` with all the same instance & static methods
        //  MySwal.showLoading()
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // alert(ratingValue);
        // return;

        setStepRating(learnerContext.currentStep._id, ratingValue);

        setStepRating(learnerContext.currentStep._id, ratingValue);

        persistAndSaveCurrentStep("done",aborted);

        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            currentStep: null,
          };
        });

        socket.emit("updated", learnerContext.currentRun._id);
      }
    });
  };

  const stepActivator = () => {
    let nextStep = null;
    let suspendedSteps = null;

    suspendedSteps = learnerContext.studentSteps.filter(
      (step) => step.status === "suspended"
    );

    if (suspendedSteps && suspendedSteps.length > 0) {
      nextStep = suspendedSteps.reduce(function (prev, current) {
        return prev.order < current.order ? prev : current;
      });
    } else {
      if (reachedLastStep())
        return Swal.fire({
          title: "No more step",
          text: "You reached the last step of the sessions!",
          icon: "error",
          confirmButtonText: "Close",
        });

      let followingSteps = learnerContext.studentSteps.filter(
        (step) => step.status === "inactive"
      );

      if (followingSteps && followingSteps.length > 0) {
        nextStep = followingSteps.reduce(function (prev, current) {
          return prev.order < current.order ? prev : current;
        });
      }
    }

    if (nextStep) {
      if (canActivateStep(nextStep)) {
        //prompt('can activate')
        setStepStatus(nextStep._id, "active");
        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            currentStep: nextStep,
          };
        });
        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            currentStep: nextStep,
          };
        });
        socket.emit("updated", learnerContext.currentRun._id);
        setTimeout(startClockWatch(nextStep.duration), 2000);
      } else {
        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            currentStep: null,
          };
        });

        Swal.fire({
          title: "Synchronisation step",
          text: "There is a step where the whole class must be aligned. Please hold on!",
          icon: "error",
          confirmButtonText: "Close",
        });
      }
      socket.emit("updated", learnerContext.currentRun._id);
    }
  };

  const persistAndSaveCurrentStep = (status, aborted) => {
    saveStepDuration(learnerContext.currentStep._id, getClockWatchValue());

    stopClockWatch();

    setStepStatus(learnerContext.currentStep._id, status);
    setStepLock(learnerContext.currentStep._id, true);

    computeActiveStepGrade(aborted);

    socket.emit("updated", learnerContext.currentRun._id);
  };

  const handleStartSession = () => {
    if (!sessionIsRunning())
      return Swal.fire({
        title: "Session not running",
        text: "Please wait for the teacher/instructor to start this session and try again",
        icon: "error",
        confirmButtonText: "Close",
      });
    else return stepActivator();
  };

  const handleGotoStep = (nextStep) => {
    if (!sessionIsRunning())
      return Swal.fire({
        title: "Session not running",
        text: "Please wait for the teacher/instructor to start this session and try again",
        icon: "error",
        confirmButtonText: "Close",
      });

    if (nextStep.locked) {
      if (learnerContext.waitingURequest.stepID) {
        if (learnerContext.waitingURequest.stepID === nextStep._id) {
          Swal.fire({
            title: "An unlock request is sent",
            text: "Un-send unlock request ?",
            icon: "info",
            confirmButtonText: "Cancel unlock request",
            cancelButtonText: "Close",
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              cancelCurrentUnlockRequest();
              // learnerContext.socket.emit(
              //   "updated",
              //   learnerContext.currentRun._id
              // );
            } else if (result.isDenied) {
              console.log("...");
            }
          });
        } else
          Swal.fire({
            title: "One unlock request at a time",
            text: "If you want to go back to this step, you have to ask the teacher to unlock it for you. Be sending this request, the precedent unlock request for another step will be cancelled. Continue ?",
            icon: "error",
            confirmButtonText: "Ask to unlock this step",
            cancelButtonText: "Wait the running request",
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              handleAskUnlockStep(nextStep);
              // learnerContext.socket.emit(
              //   "updated",
              //   learnerContext.currentRun._id
              // );
            } 
          });
      } else
        Swal.fire({
          title: "This step is locked!",
          text: "If you want to go back to this step, you have to ask the teacher to unlock it for you",
          icon: "error",
          confirmButtonText: "Ask to unlock",
          cancelButtonText: "Cancel",
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            handleAskUnlockStep(nextStep);
          }
        });
      return;
    }

    if (learnerContext.currentStep) {
      persistAndSaveCurrentStep("suspended", false);
      setStepLock(learnerContext.currentStep._id, true);
      //stepActivator();
    }

    setStepStatus(nextStep._id, "active");
    setLearnerContext((prevContext) => {
      return {
        ...prevContext,
        currentStep: nextStep,
      };
    });
    // setTimeout(startClockWatch(nextStep.duration), 3000);
    startClockWatch(nextStep.duration);

    socket.emit("updated", learnerContext.currentRun._id);
  };

  const handleFinishAndNextStep = () => {
    if (!sessionIsRunning()) {
      return Swal.fire({
        title: "Session not running",
        text: "Please wait for the teacher/instructor to start this session and try again",
        icon: "error",
        confirmButtonText: "Close",
      });
    }

    let ratingValue = 3;
    let title = "How was your learning at this step?";
    const html = (
      <>
        {" "}
        This action will stop the current step. Indicate your level of
        understanding <br />
        <Rating
          fillColorArray={[
            "#f14f45",
            "#f16c45",
            "#f18845",
            "#f1b345",
            "#f1d045",
          ]}
          onClick={(r) => {
            ratingValue = r;
          }}
          initialValue={ratingValue}
        />
      </>
    );

    MySwal.fire({
      title: title,
      icon: "question",
      confirmButtonText: "Finish the step",
      cancelButtonText: "Cancel",
      showDenyButton: false,
      showCancelButton: true,
      html: html,
    }).then((result) => {
      if (result.isConfirmed) {
        if (learnerContext.currentStep) {
          setStepRating(learnerContext.currentStep._id, ratingValue);
          persistAndSaveCurrentStep("done", false);
          stepActivator();
        }

        socket.emit("updated", learnerContext.currentRun._id);
      }
    });
  };

  const sessionIsRunning = () => {
    if (
      learnerContext.currentRun.status === "idle" ||
      learnerContext.currentRun.status === "paused" ||
      learnerContext.currentRun.status === "finished"
    )
      return false;
    else return true;
  };

  const canActivateThisStep = (step) => {
    if (!sessionIsRunning()) return false;
    if (!step.synchro) return true;
    else {
      const classStep = learnerContext.classSteps.filter(
        (s) => s._id === step.stepID
      );

      if (classStep.length > 0) {
        const classStatus = classStep[0].status;
        if (classStatus !== "done") return false;
        else return true;
      }
    }
  };

  const canActivateStep = (step) => {
    if (!sessionIsRunning()) return false;
    const classSynchroPoints = learnerContext.classSteps.filter(
      (s) => s.synchro && s.order < step.order && s.status !== "done"
    );

    if (classSynchroPoints && classSynchroPoints.length > 0) return false;
    else return true;
  };

  const cancelCurrentUnlockRequest = () => {
    const params = {
      action: "CANCEL_UNLOCK_REQUEST",
      unlockID: learnerContext.waitingURequest.unlockID,
    };
    cancelUnlockRequest(params)
      .then((response) => {
        setWaitingUnlock(null, null);
        socket.emit("updated", learnerContext.currentRun._id);
      })
      .catch((e) => "Error cancelling help request");
  };

  const handleAskUnlockStep = (step) => {
    if (learnerContext.waitingURequest.stepID === step._id) {
      cancelCurrentUnlockRequest();
    } else {
      cancelCurrentUnlockRequest();
      const params = {
        action: "CREATE_UNLOCK_REQUEST",
        runID: learnerContext.currentRun._id,
        student: learnerContext.student,
        stepID: step.stepID,
        stepOrder: step.order,
        stStepID: step._id,
        status: "waiting",
        date: new Date(),
      };
      createUnlockRequest(params)
        .then((response) => {
          setWaitingUnlock(step._id, response);
          socket.emit("updated", learnerContext.currentRun._id);
        })
        .catch((e) => {
          console.log("Error creating help request");
        });
    }
  };

  return (
    <Row className="card text-dark mb-3 p-0  h-100 m-2">
      <div className="card-header bg-dark text-white ">Steps control</div>
      <div className="card-body" style={{backgroundColor:'#F8FAFC'}}>
        <div className="w-100 d-flex justify-content-center">
          <div className="btn-group m-1">
            {learnerContext.currentStep && (
              <>
                <button
                  type="button"
                  className="btn btn-primary rounded-right m-1"
                  onClick={() => handleFinishStep(false)}
                >
                  Finish
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-right m-1"
                  onClick={() => handleFinishAndNextStep(false)}
                >
                  Finish & Next
                </button>

                <button
                  type="button"
                  className="btn btn-danger m-1"
                  onClick={() => handleFinishStep(true)}
                >
                  Abort
                </button>
              </>
            )}
            {!(learnerContext.currentStep ) && (
              <button
                type="button"
                className="btn btn-success rounded-right m-1"
                onClick={handleStartSession}
              >
                Start/resume
              </button>
            )}
          </div>
        </div>
        {/* <button type="button" className="btn btn-primary" >
          Start
        </button> */}
        <div className="container-fluid table-responsive">
          <table className="steps-control-table table  table-responsive  table-responsive">
            <tbody>
              <tr>
                {learnerContext.studentSteps &&
                  learnerContext.studentSteps
                    .sort((a, b) => (a.order > b.order ? 1 : -1))
                    .map((step) => {
                      if (step.status === "done") {
                        const role = step.locked ? "button" : " ";
                        //const onclick = step.locked ? console.log : console.log;
                        const icon = step.locked ? (
                          <FontAwesomeIcon
                            icon={faLock}
                            role="button"
                            // onClick={() => onclick(step)}
                          />
                        ) : (
                          " "
                        );
                        return (
                          <td
                            key={step._id}
                            className={`step ${step.grade}`}
                            role="button"
                            onClick={() => handleGotoStep(step)}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                <Badge bg="dark">{step.order}</Badge>{" "}
                                {step.title} &nbsp;
                                {step._id ===
                                learnerContext.waitingURequest.stepID ? (
                                  <span
                                    className="spinner-border spinner-border-sm m-0"
                                    role={role}
                                  />
                                ) : (
                                  icon
                                )}
                                <br />
                                {step.synchro && (
                                  <FontAwesomeIcon icon={faBookmark} />
                                )}
                              </div>
                              {learnerContext.classActiveStep &&
                                learnerContext.classActiveStep._id ===
                                  step.stepID && (
                                  <FontAwesomeIcon icon={faPersonChalkboard} />
                                )}{" "}
                            </div>
                          </td>
                        );
                      } else if (learnerContext.currentStep && step._id === learnerContext.currentStep._id)
                        return (
                          <td key={step._id} className={`step ${step.status}`}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <span className="spinner-grow">
                                  <b className="text-dark">{step.order}</b>
                                </span>
                                &nbsp; {step.title}
                                {step.synchro && (
                                  <FontAwesomeIcon icon={faBookmark} />
                                )}
                              </div>
                              <div>
                                {learnerContext.classActiveStep &&
                                  learnerContext.classActiveStep._id ===
                                    step.stepID && (
                                    <span className="position-absolute end-0">
                                      <FontAwesomeIcon
                                        icon={faPersonChalkboard}
                                      />
                                    </span>
                                  )}
                              </div>
                            </div>
                          </td>
                        );
                      else if (step.status === "suspended")
                        return (
                          <td key={step._id} className={`step ${step.status}`}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <FontAwesomeIcon icon={faPauseCircle} /> Step{" "}
                                {step.order}
                                <br />
                                {step.synchro && (
                                  <FontAwesomeIcon icon={faBookmark} />
                                )}
                              </div>
                              <div>
                                {learnerContext.classActiveStep &&
                                  learnerContext.classActiveStep._id ===
                                    step.stepID && (
                                    <span className="position-absolute end-0">
                                      <FontAwesomeIcon
                                        icon={faPersonChalkboard}
                                      />
                                    </span>
                                  )}
                              </div>
                            </div>
                          </td>
                        );
                      else
                        return (
                          <td className={`step ${step.status}`}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Badge bg="dark">{step.order}</Badge>{" "}
                                {step.title}
                                <br />
                                {step.synchro && (
                                  <FontAwesomeIcon icon={faBookmark} />
                                )}
                              </div>
                              <div>
                                {learnerContext.classActiveStep &&
                                  learnerContext.classActiveStep._id ===
                                    step.stepID && (
                                    <FontAwesomeIcon
                                      icon={faPersonChalkboard}
                                    />
                                  )}
                              </div>
                            </div>
                          </td>
                        );
                    })}
              </tr>

              <tr>
                {learnerContext.studentSteps &&
                  learnerContext.studentSteps
                    .sort((a, b) => (a.order > b.order ? 1 : -1))
                    .map((step) => {
                      if (step.status === "done")
                        return (
                          <td key={step._id}>
                            {step.grade === "success" ? (
                              <div className="badge bg-success">
                                {moment(step.duration * 1000).format("mm:ss")}{" "}
                                <FontAwesomeIcon icon={faCheck} />
                              </div>
                            ) : step.grade === "issue" ? (
                              <div className="badge bg-danger">
                                {" "}
                                {moment(step.duration * 1000).format(
                                  "mm:ss"
                                )}{" "}
                                <FontAwesomeIcon icon={faXmarkCircle} />
                              </div>
                            ) : (
                              <div className="badge bg-warning">
                                {" "}
                                {moment(step.duration * 1000).format(
                                  "mm:ss"
                                )}{" "}
                                <FontAwesomeIcon icon={faExclamationCircle} />{" "}
                                &nbsp; +{step.difftime} mn
                              </div>
                            )}
                          </td>
                        );
                      else if (learnerContext.currentStep && step._id === learnerContext.currentStep._id)
                        return (
                          <td key={step.stepID}>
                            <label className="bg-dark border position-relative text-white time-elapsed p-2">
                              <span>
                                <FontAwesomeIcon icon={faClockFour} /> &nbsp;
                              </span>
                              <Timer
                                time={timerValue}
                                setTime={setTimerValue}
                                running={timerRunning}
                                setRunning={setTimerRunning}
                              />
                            </label>
                          </td>
                        );
                      else return <td></td>;
                    })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Row>
  );
};

export default LearnerStepsCtrl;
