import { useContext, useEffect, useState } from "react";
import { Button, ButtonGroup, Col } from "react-bootstrap";
import {
  getLearnersSteps,
  getRunHelpRequest,
  getRunUnlockRequest,
} from "../../services/HelpService";
import { MenuContext } from "../../App";
import ConnectedLearnersView from "./ConnectedLearnersView";
import GlobalChart from "./GlobalChart";
import ClassStateChart from "./ClassStateChart";
import SessionSelection from "./SessionSelection";
import TeacherStepsCtrl from "./TeacherStepsCtrl";
import StudentChart from "./StudentChart";
import "./TeacherBoard.css";
import { getAllSteps, getSessionSteps } from "../../services/SessionService";
import { TeacherContext } from "./TeacherHome";
import { getRunTroubleRequest } from "../../services/TroubleService";

import io from "socket.io-client";
import { computeRunGrades, getRunGrades } from "../../services/RunService";
import StudentView from "./StudentView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

const TeacherBoard = () => {
  const [showSessionSelection, setShowSessionSelection] = useState(false);
  const toggleShowSessionSelection = () => setShowSessionSelection((p) => !p);
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [socketConnected, setSocketConnected] = useState(false);

  const [studentView, setStudentView] = useState(false);
  const [statView, setStatView] = useState(false);
  const [selectedStudent, setselectedStudent] = useState(null);
  const selectStudent = (stdView, stdName) => {
    if (stdView) {
      setStudentView(true);
      setselectedStudent(stdName);
    } else {
      setStudentView(false);
      setselectedStudent(null);
    }
  };

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!teacherContext) return;
    if (!socket) {
      const newSocket = io();
      setSocket(newSocket);
    } else {
      socket.on("connect", () => {});

      socket.on("disconnect", () => {});

      socket.on("do_update", () => {
        reloadTeacherContext();
      });
      if (teacherContext.currentRun)
        socket.emit("updated", teacherContext.currentRun);

      return () => {
        socket.off("connect");
        socket.off("do_update");
        socket.off("disconnect");
        socket.disconnect();
      };
    }
  }, [socket]);

  useEffect(() => {
    if (!teacherContext || !socket) return;
    socket.on("connect", () => {
      console.log("connect");
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });

    socket.on("do_update", () => {
      reloadTeacherContext();
    });

    return () => {
      socket.off("connect");
      socket.off("do_update");
      socket.off("disconnect");
    };
  }, [teacherContext]);

  const reloadTeacherContext = () => {
    
    getSessionSteps(teacherContext.session)
      .then((response) => {
        let steps = [];
        if (response && response.length > 0) {
          steps = response.sort(({ order: a }, { order: b }) => b - a);
        }
        setTeacherContext((prevContext) => {
          return {
            ...prevContext,
            steps: steps,
          };
        });
        computeRunGrades(teacherContext.currentRun)
      })
      .catch((error) => {
        console.log(error);
      });

    getRunHelpRequest(teacherContext.currentRun).then((hr) => {
      getRunUnlockRequest(teacherContext.currentRun).then((ur) => {
        getLearnersSteps(teacherContext.currentRun).then((ls) => {
          getRunTroubleRequest(teacherContext.currentRun).then((tr) => {
            getRunGrades(teacherContext.currentRun).then((gr) => {
              setTeacherContext((prevContext) => {
                return {
                  ...prevContext,
                  learnersSteps: ls,
                  learnersGrades: gr,
                  helpRequests: hr,
                  unlockRequests: ur,
                  troubles: tr,
                };
              });
            });
          });
        });
      });
    });
  };

  return (
    <div className="row ">
      {!teacherContext.currentRun && (
        <>
          <h2>No course session selected</h2>
          <SessionSelection />{" "}
        </>
      )}

      {teacherContext.currentRun && (
        <>
          {/* <div className="col-8 p-4 border border-top-0 border-bottom-0 border-left-0"> */}
          <Col
            xs={12}
            sm={10}
            md={8}
            className="p-4 border border-top-0 border-bottom-0 border-left-0"
          >
            <TeacherStepsCtrl />
            

            {studentView ? (
              <h5 className="bg-info text-white p-2 rounded-top">
                <div class="position-relative">
                  <FontAwesomeIcon
                    size="2x"
                    icon={faUserCircle}
                    color="white"
                  ></FontAwesomeIcon>{" "}
                  &nbsp; {selectedStudent}
                  <span
                    className="badge bg-danger rounded-circle position-absolute top-0 end-0"
                    role={"button"}
                    onClick={() => setStudentView(false)}
                  >
                    X
                  </span>
                </div>{" "}
              </h5>
            ) : (
              <h5 className="">
                {" "}
                <ButtonGroup>
                  <Button
                    variant={statView ? "secondary" : "dark"}
                    onClick={() => setStatView(false)}
                  >
                    Class View
                  </Button>
                  <Button
                    variant={!statView ? "secondary" : "dark"}
                    onClick={() => setStatView(true)}
                  >
                    Stats View
                  </Button>
                </ButtonGroup>
              </h5>
            )}
            {studentView ? (
              <StudentView
                seeStudent={selectStudent}
                selectedStudent={selectedStudent}
              />
            ) : statView ? (
              <GlobalChart />
            ) : (
              <ClassStateChart />
            )}
          </Col>
          <Col xs={12} md={4} className="p-4">
            <ConnectedLearnersView
              seeStudent={selectStudent}
              studentView={studentView}
              selectedStudent={selectedStudent}
            />
          </Col>{" "}
        </>
      )}
    </div>
  );
};

export default TeacherBoard;
