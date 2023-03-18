import LearnerStepsCtrl from "./LearnerStepsCtrl";
import "./StudentBoard.css";
import {faHand,  faPersonFallingBurst} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createContext, useContext, useEffect, useState } from "react";
import LearnerSessionSelection from "./LearnerSessionSelection";
import { Button, Col, Row } from "react-bootstrap";
import {
  getSessionSteps,
  interactStudentRun,
} from "../../services/SessionService";
import { cancelHelpRequest,
  checkHelpRequest,
  checkUnlockRequest,
  createHelpRequest,
} from "../../services/HelpService";
import Notification from "../Notification";
import { getRun } from "../../services/RunService";
import { MenuContext } from "../../App";
import {
  cancelTroubleRequest,
  createTroubleRequest,
} from "../../services/TroubleService";

import io from "socket.io-client";
import configs from "../../config";
const ENDPOINT = configs.SOCKET_IO_ENDPOINT;
const socket = io();
// const ENDPOINT =  "http://localhost:3080";


export const LearnerSessionContext = createContext({
  student: null,
  session: null,
  studentSteps: null,
  currentStep: null,
  classActiveStep: null,
  currentRun: null,
  classSteps: null,
  waitingHRequest: null,
  waitingTrouble: null,
  waitingNotUnderstand: null,
  waitingURequest: {
    stepID: null,
    unlockID: null,
  },
  timer: null,
});

const StudentBoard = (props) => {

  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] =
    useState("Your request");
  const { menuContext, setMenuContext } = useContext(MenuContext);

  const [socketConnected, setSocketConnected] = useState(false);

  

  const [learnerContext, setLearnerContext] = useState({
    student: props.username,
    course: null,
    session: null,
    currentStep: null,
    classActiveStep: null,
    currentRun: null,
    classSteps: null,
    timer: null,
    waitingTrouble: null,
    waitingNotUnderstand: false,
  });


  

  useEffect(() => {
    if(!learnerContext || !learnerContext.currentRun)
      return;
    socket.on('connect', () => {
      socket.emit("updated", learnerContext.currentRun._id);
    });

    socket.on('disconnect', () => {
    //  console.log('disconnect');
    });

    socket.on("do_update", () => {
      //console.log("Let's update Learner context ");
      do_updating();
    });

    socket.on("help_answered", (id) => {
     // console.log("socket.io help_answered!:", id);
      receivedAnsweredHelpRequest(id);
      setSocketConnected(true);
    });

    socket.on("unlock_accepted", (id) => {
//console.log("socket.io help_answered!:", id);
      receivedAnsweredUnlockRequest(id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (err) => {
      //console.log("socket error:", err);
      setSocketConnected(false);
    });

   
    return () => {
      socket.off('connect');
      socket.off('do_update');
      socket.off('help_answered');
      socket.off('unlock_accepted');
      socket.off('disconnect');
    };
  }, [learnerContext]);

  const startSession = (course, session) => {
    setMenuContext((prev) => {
      return { ...prev, course: course, session: session };
    });
  };

  

  const do_updating = () => {
    
    GetClassData();
    GetStudentData();
  };

  const receivedAnsweredUnlockRequest = (u) => {
    if (learnerContext.waitingURequest.unlockID === u) {
      setNotificationContent("Teacher has responded to your unlock request");
      setShowNotification(true);
      setLearnerContext((prevContext) => {
        return {
          ...prevContext,
          waitingURequest: {
            stepID: null,
            unlockID: null,
          },
        };
      });
    } 
  };
  const receivedAnsweredHelpRequest = (answer) => {
    if (learnerContext.waitingHRequest === answer) {
      setNotificationContent("Teacher will soon answer your help request");
      setShowNotification(true);
      setLearnerContext((prevContext) => {
        return {
          ...prevContext,
          waitingHRequest: null,
        };
      });
    } 
      // console.log("bad answer:", learnerContext.waitingHRequest, "-", answer);
  };

  const setClassActiveStep = (step) => {
    setLearnerContext((prevContext) => {
      return {
        ...prevContext,
        classActiveStep: step,
      };
    });
  };

  const setLearnerActiveStep = (step) => {
    setLearnerContext((prevContext) => {
      return {
        ...prevContext,
        currentStep: step,
      };
    });
  };

  const GetStudentData = () => {
    const action = "GET_USER_SESSION";
    const params = {
      runid: learnerContext.currentRun._id,
      username: learnerContext.student,
      sessionid: learnerContext.currentRun.sessionID,
    };

    interactStudentRun(action, params)
      .then((response) => {
        let steps = [];
        if (response && response.length > 0) {
          steps = response.sort(({ order: a }, { order: b }) => b - a);
        }

        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            studentSteps: steps,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    /////////////////////////////////////////////////////////////:
    if (!learnerContext.classSteps) setClassActiveStep(null);
    else {
      let step = learnerContext.classSteps.filter(
        (step) => step.status === "active"
      );

      if (step) setClassActiveStep(step[0]);
      else setClassActiveStep(null);
    }
    if (!learnerContext.studentSteps) setLearnerActiveStep(null);
    else {
      let lstep = learnerContext.currentStep;
      // console.log(lstep);
      if (lstep) setLearnerActiveStep(lstep);
      else setLearnerActiveStep(null);
    }
    // if (!sessionIsRunning()) setLearnerActiveStep(null);
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

  const GetClassData = () => {
    getRun(learnerContext.currentRun._id)
      .then((run) => {
        getSessionSteps(learnerContext.session).then((response) => {
          let steps = [];
          if (response && response.length > 0) {
            steps = response.sort(({ order: a }, { order: b }) => b - a);
          }

          setLearnerContext((prevContext) => {
            return {
              ...prevContext,
              classSteps: steps,
              currentRun: run,
            };
          });
        });
      })
      .catch((error) => {
        // setError("apiError", { message: error });
        console.log(error);
      });
  };

  const onNewHelpRequest = () => {
    if(!learnerContext.currentStep || learnerContext.currentStep.length < 1) return;
    let cStep = null;
    if (learnerContext.currentStep) cStep = learnerContext.currentStep.stepID;
    const params = {
      action: "CREATE_HELP_REQUEST",
      runID: learnerContext.currentRun._id,
      student: learnerContext.student,
      stepID: cStep,
      status: "waiting",
      date: new Date(),
    };
    createHelpRequest(params)
      .then((response) => {
        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            waitingHRequest: response,
          };
        });
      })
      .catch((e) => {
        console.log("Error creating help request");
      });
    socket.emit("updated", learnerContext.currentRun._id);
  };

  const onCancelHelpRequest = () => {
    const params = {
      action: "CANCEL_HELP_REQUEST",
      helpID: learnerContext.waitingHRequest,
    };
    cancelHelpRequest(params)
      .then((response) => {
        setLearnerContext((prevContext) => {
          return {
            ...prevContext,
            waitingHRequest: null,
          };
        });
      })
      .catch((e) => console.log("Error cancelling help request"));
    socket.emit("updated", learnerContext.currentRun._id);
  };

  const onSwitchTrouble = () => {
    const inTrouble = learnerContext.waitingTrouble;
    if (inTrouble) {
      const params = {
        action: "CANCEL_TROUBLE",
        troubleID: inTrouble,
      };
      cancelTroubleRequest(params)
        .then((response) => {
          setLearnerContext((prevContext) => {
            return {
              ...prevContext,
              waitingTrouble: null,
            };
          });
        })
        .catch((e) => console.log("Error cancelling help request"));
    } else {
      if(!learnerContext.currentStep) return;
      let cStep = null;
      if (learnerContext.currentStep) cStep = learnerContext.currentStep.stepID;
      const params = {
        action: "CREATE_TROUBLE",
        runID: learnerContext.currentRun._id,
        student: learnerContext.student,
        stepID: cStep,
        status: "waiting",
        type: "trouble",
        date: new Date(),
      };
      createTroubleRequest(params)
        .then((response) => {
          setLearnerContext((prevContext) => {
            return {
              ...prevContext,
              waitingTrouble: response,
            };
          });
        })
        .catch((e) => {
          console.log("Error creating trouble request");
        });
    }


    socket.emit("updated", learnerContext.currentRun._id);
  };

  const onSwitchNotUnderstand = () => {
    const inTrouble = learnerContext.waitingNotUnderstand;
    if (inTrouble) {
      const params = {
        action: "CANCEL_TROUBLE",
        troubleID: inTrouble,
      };
      cancelTroubleRequest(params)
        .then((response) => {
          setLearnerContext((prevContext) => {
            return {
              ...prevContext,
              waitingNotUnderstand: null,
            };
          });
        })
        .catch((e) => console.log("Error cancelling NotUnderstand"));
    } else {
      let cStep = null;
      if (learnerContext.currentStep) cStep = learnerContext.currentStep._id;
      const params = {
        action: "CREATE_TROUBLE",
        runID: learnerContext.currentRun._id,
        student: learnerContext.student,
        stepID: cStep,
        status: "waiting",
        type: "notunderstand",
        date: new Date(),
      };
      createTroubleRequest(params)
        .then((response) => {
          setLearnerContext((prevContext) => {
            return {
              ...prevContext,
              waitingNotUnderstand: response,
            };
          });
        })
        .catch((e) => {
          console.log("Error creating trouble request");
        });
    }
  };

  return (
    <LearnerSessionContext.Provider
      value={{ learnerContext, setLearnerContext }}
    >
      <Notification
        title="Your request"
        body={notificationContent}
        show={showNotification}
        setShow={setShowNotification}
      />
      <div className="row  justify-content-center ">
        {!(learnerContext && learnerContext.currentRun) && (
          <LearnerSessionSelection show={true} startSession={startSession} />
        )}
        {/* <Button onClick={toggleShowSessionSelection}>Select a session</Button>
        <hr /> */}
        {learnerContext && learnerContext.currentRun && (
          <>
            <Row className="card p-0 w-75  justify-content-center border-info m-5 shadow-lg bg-white border">
              <div className="card-header text-primary bg-info text-light text-center ">
                <h4 className="card-title">
                  You have a question ? You need help ?
                </h4>{" "}
              </div>
              <Row className="grid-divider">
                <Col xs={6} sm={6} md={6}>
                  <div className="card-body text-center " role={learnerContext.currentStep? "button": ""}>
                    {learnerContext.waitingTrouble ? (
                      <>
                        <FontAwesomeIcon
                          icon={faPersonFallingBurst}
                          color="#ffbe76"
                          size="10x"
                          onClick={onSwitchTrouble}
                        />

                        <h5 className="text-danger m-3">
                          Click again once the trouble is gone
                        </h5>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faPersonFallingBurst}
                          color={learnerContext.currentStep? "#59AFFD": "#b2d3f1"}
                          size="10x"
                          onClick={onSwitchTrouble}
                          
                        />
                        <h5 className="text-info m-3">
                          {" "}
                          Signal a trouble{" "}
                          <div className="alert alert" role="alert"></div>
                        </h5>
                      </>
                    )}
                  </div>
                </Col>
                {/* <Col xs={4} sm={4} md={4}>
                  <div className="card-body text-center" role={"button"}>
                    {learnerContext.waitingNotUnderstand ? (
                      <>
                        <FontAwesomeIcon
                          icon={faCircleQuestion}
                          color="#ffbe76"
                          size="10x"
                          onClick={onSwitchNotUnderstand}
                        />

                        <h5 className="text-danger m-3">
                          Click again if you finally get it
                        </h5>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCircleQuestion}
                          color="#59AFFD"
                          size="10x"
                          onClick={onSwitchNotUnderstand}
                        />
                        <h5 className="text-info m-3">
                          {" "}
                          Didn't understand ?{" "}
                          <div className="alert alert" role="alert"></div>
                        </h5>
                      </>
                    )}
                  </div>
                </Col> */}
                <Col xs={6} sm={6} md={6}>
                  <div className="card-body text-center" role={learnerContext.currentStep? "button": ""}>
                    {learnerContext.waitingHRequest ? (
                      <>
                        <FontAwesomeIcon
                          icon={faHand}
                          color="lightgray"
                          size="10x"
                          onClick={onCancelHelpRequest}
                        />

                        <h5 className="text-danger m-3">
                          Click to put your hand down, and cancel your request
                          <div className="alert alert-info" role="alert">
                            Waiting the teacher{" "}
                            <span className="spinner-border spinner-border-sm float-right"></span>
                          </div>
                        </h5>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faHand}
                          color={learnerContext.currentStep? "#59AFFD": "#b2d3f1"}
                          size="10x"
                          onClick={onNewHelpRequest}
                        />
                        <h5 className="text-info m-3">
                          {" "}
                          Raise your hand{" "}
                          <div className="alert alert" role="alert"></div>
                        </h5>
                      </>
                    )}
                  </div>
                </Col>
              </Row>
            </Row>

            <LearnerStepsCtrl
              setSelectedSession={learnerContext.session}
              setShowNotification={setShowNotification}
              setNotificationContent={setNotificationContent}
            />
          </>
        )}
      </div>
    </LearnerSessionContext.Provider>
  );
};

export default StudentBoard;
