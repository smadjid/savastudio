import {
  faMinus,
  faMinusCircle,
  faPen,
  faPlus,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { interactRun } from "../../services/RunService";
import Swal from "sweetalert2";

import {
  getAllSessions,
  getAllSteps,
  getCourseSessions,
  getSessionSteps,
  interactSession,
  updateSession,
} from "../../services/SessionService";
import { TeacherContext } from "./TeacherHome";
import {
  createNewCourse,
  createNewCourseSession,
  disableCourse,
  disableCourseSession,
  editCourse,
  editCourseSession,
  getTeacherCourse,
  SetUserRunningCourse,
} from "../../services/CourseService";
import { MenuContext } from "../../App";
import moment from "moment";

function TableRows({ stepsData, deleteSteps, handleStepChange }) {
  stepsData.sort((a, b) => (a.order > b.order ? 1 : -1));

  return stepsData.map((data, index) => {
    const { title, expDuration, synchro, order } = data;
    return (
      <tr key={order}>
        <td>
          <input
            type="text"
            value={index + 1}
            onChange={(evnt) => handleStepChange(index, false, evnt)}
            className="form-control"
            disabled
          />
        </td>
        <td>
          <Form.Group className="mb-3">
            {/* <Form.Label>Title</Form.Label> */}
            <Form.Control
              type="text"
              name="title"
              value={title}
              onChange={(evnt) => handleStepChange(index, false, evnt)}
              placeholder="Step title"
            />
          </Form.Group>
        </td>
        <td>
          <input
            type="number"
            value={expDuration}
            onChange={(evnt) => handleStepChange(index, false, evnt)}
            name="expDuration"
            className="form-control"
            min={0}
            onKeyPress={(event) => {
              if (
                event?.key === "-" ||
                event?.key === "+" ||
                event?.key === "."
              ) {
                event.preventDefault();
              }
            }}
          />{" "}
        </td>
        {/* <td>
          <Form.Check
            type="switch"
            label=""
            checked={locked}
            onChange={(evnt) => handleStepChange(index, true, evnt)}
            name="locked"
          />
        </td> */}
        <td>
          <Form.Check
            type="switch"
            checked={synchro}
            onChange={(evnt) => handleStepChange(index, true, evnt)}
            name="synchro"
          />
        </td>
        <td style={{ textAlign: "right" }}>
          <button className="btn btn-danger" onClick={() => deleteSteps(index)}>
            x
          </button>
        </td>
      </tr>
    );
  });
}

const SessionStepsDetails = (props) => {
  const { stepsData, setStepsData } = props;

  const addTableRows = () => {
    const stepsInupt = {
      _id: null,
      title: "Step " + (stepsData.length + 1),
      expDuration: "",
      sessionID: props.session,
      order: stepsData.length + 1,
      // locked: false,
      synchro: false,
    };
    setStepsData([...stepsData, stepsInupt]);
  };

  const deleteSteps = (index) => {
    const rows = [...stepsData];
    rows.splice(index, 1);
    setStepsData(rows);
  };

  const handleStepChange = (index, check, evnt) => {
    const { name, value, checked } = evnt.target;
    const stepsInupt = [...stepsData];
    if (check) stepsInupt[index][name] = checked;
    else stepsInupt[index][name] = value;
    setStepsData(stepsInupt);
  };
  return (
    <div className="row">
      <table className="table table-dark table-stripped table-hover table-sm">
        <thead className="thead-dark">
          <tr>
            <th colSpan={5} style={{ textAlign: "right" }}>
              <button className="btn btn-warning" onClick={props.reloadSession}>
                Reload
              </button>{" "}
              &nbsp;
              <button className="btn btn-success" onClick={props.saveSession}>
                Save
              </button>{" "}
              |&nbsp;
              <button className="btn btn-primary" onClick={addTableRows}>
                +step
              </button>
            </th>
          </tr>
          <tr>
            <th style={{ width: "10%" }}>#</th>
            <th style={{ width: "50%" }}>Title</th>
            <th style={{ width: "10%" }}>Duration (mn)</th>
            {/* <th style={{ width: "10%" }}>Locked</th> */}
            <th style={{ width: "10%" }}>Synchro point</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          <TableRows
            stepsData={stepsData}
            deleteSteps={deleteSteps}
            handleStepChange={handleStepChange}
          />
        </tbody>
      </table>
    </div>
  );
};

const SessionConfigurator = (props) => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [stepsData, setStepsData] = useState([]);

  const [teacherCourses, setTeacherCourses] = useState([]);
  const [courseSelectComponentValue, setCourseSelectComponentValue] =
    useState();
  const [sessionSelectComponentValue, setSessionSelectComponentValue] =
    useState();
  const [courseSessions, setCourseSessions] = useState([]);
  const [selectedSessionSteps, setSelectedSessionSteps] = useState([]);
  const [selectedSession, setSelectedSession] = useState();
  const [selectedCourse, setSelectedCourse] = useState();
  const [sessionLastActiveRun, setSessionLastActiveRun] = useState();
  const { menuContext, setMenuContext } = useContext(MenuContext);

  const [showSteps, setShowSteps] = useState(false);
  const toggleShowSteps = () => setShowSteps((p) => !p);

  useEffect(() => {
    fetchTeacherCourses();
  }, [teacherContext.teacher]);

  const fetchTeacherCourses = async () => {
    try {
      getTeacherCourse(teacherContext.teacher).then((courses) => {
        if (courses.length > 0) {
          setTeacherCourses(
            courses.map((c, index) => {
              const label = c.title;
              const value = index;
              const courseId = c._id;
              return { value, label, courseId };
            })
          );
        }
        if (selectedCourse) {
          // handleSelectCourse(selectedCourse)
          console.log("selectedCourse:", selectedCourse);
        }
      });
    } catch (error) {
      console.log("error in fetching teacher courses");

      return;
    }
  };

  const handleNewCourse = () => {
    Swal.fire({
      title: "Course title",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      showLoaderOnConfirm: true,
      preConfirm: (title) => {
        if (title.length > 0) {
          createNewCourse(teacherContext.teacher, title).then((result) => {
            fetchTeacherCourses();
            setCourseSelectComponentValue(null);
            setSessionSelectComponentValue(null);
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };
  const handleEditCourse = () => {
    Swal.fire({
      title: "Update course title",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      showLoaderOnConfirm: true,
      preConfirm: (title) => {
        if (title.length > 0) {
          editCourse(selectedCourse, title).then((result) => {
            fetchTeacherCourses();
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  const handleDeleteCourse = () => {
    Swal.fire({
      title: "Delete the course?",
      text: "Are you sure ? Deleting the course will delete all its sessions and data",
      icon: "error",
      confirmButtonText: "I understand. Delete anyway",
      cancelButtonText: "Cancel",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        disableCourse(selectedCourse).then((result) => {
          fetchTeacherCourses();
            setCourseSelectComponentValue(null);
            setSessionSelectComponentValue(null);
        });
      }
    });
  };

  const handleNewSession = () => {
    Swal.fire({
      title: "Title of the session",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      showLoaderOnConfirm: true,
      preConfirm: (title) => {
        if (title.length > 0) {
          createNewCourseSession(selectedCourse, title).then((result) => {
            //setSelectedSession()
            fetchTeacherCourses();
            setCourseSelectComponentValue(null);
            setSessionSelectComponentValue(null);
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  const handleEditSession = () => {
    Swal.fire({
      title: "Update session title",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      showLoaderOnConfirm: true,
      preConfirm: (title) => {
        if (title.length > 0) {
          editCourseSession(selectedSession, title).then((result) => {
            fetchTeacherCourses();
            setCourseSelectComponentValue(null);
            setSessionSelectComponentValue(null);
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  const handleDeleteSession = () => {
    Swal.fire({
      title: "Delete the session?",
      text: "Are you sure ? Deleting the session will delete all its steps and data",
      icon: "error",
      confirmButtonText: "I understand. Delete anyway",
      cancelButtonText: "Cancel",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        disableCourseSession(selectedSession).then((result) => {
          fetchTeacherCourses();
            setCourseSelectComponentValue(null);
            setSessionSelectComponentValue(null);
        });
      }
    });
  };

  const saveSession = () => {
    let action = "";
    stepsData.sort((a, b) => (a.order > b.order ? 1 : -1));

    ///////: ADD & UPDATE
    stepsData.map((step, index) => {
      step.order = index + 1;
      if (step._id) {
        action = "UPDATE_SESSION_STEP";
        const params = step;

        updateSession(action, params);
      } else {
        action = "ADD_SESSION_STEP";
        step.status = "inactive";
        step.grade = null;
        const params = step;
        updateSession(action, params);
      }
    });
    ///////: REMOVE
    const deleteIds = selectedSessionSteps.filter(
      (orgStep) => !stepsData.some((newStep) => newStep._id === orgStep._id)
    );
    deleteIds.map((step) => {
      action = "REMOVE_SESSION_STEP";
      const params = { _id: step._id };
      updateSession(action, params);
    });

    reloadSession(selectedSession);
  };

  const deleteSessionStep = () => {
    alert("not implemented");
  };

  const handleSelectCourse = (course) => {
    setCourseSelectComponentValue(course);
    setSessionSelectComponentValue(null);

    setSelectedCourse(course.courseId);
    setSessionLastActiveRun();

    getCourseSessions(course.courseId)
      //getAllSessions()
      .then((response) => {
        setCourseSessions([]);
        response.forEach((element) => {
          setCourseSessions((sessions) => [
            ...sessions,
            { value: element._id, label: element.title },
          ]);
          setSelectedSession(null);
          reloadSession();
        });
      })
      .catch((error) => {
        // setError("apiError", { message: error });
        console.log(error);
      });
  };

  const reloadSession = (session) => {
    setStepsData([]);
    if (!session) return;
    getSessionSteps(session)
      .then((response) => {
        setSelectedSessionSteps(response);
        displaySessionSteps(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const displaySessionSteps = (dbSteps) => {
    setStepsData([]);
    dbSteps.forEach((element) => {
      setStepsData((steps) => [
        ...steps,
        {
          _id: element._id,
          title: element.title,
          expDuration: element.expDuration,
          sessionID: element.sessionID,
          order: element.order,
          // locked: element.locked,
          synchro: element.synchro,
        },
      ]);
    });
  };

  const handleSelectSession = (e) => {
    setSelectedSession(e.value);
    setSessionSelectComponentValue(e);
    setSessionLastActiveRun();
    interactRun("GET_ACTIVE_RUN", e.value, null).then((run) => {
      setSessionLastActiveRun(run);
    });
    reloadSession(e.value);
  };

  const onSubmitResume = (e) => {
    SetUserRunningCourse(selectedCourse);
    setMenuContext((prev) => {
      return {
        ...prev,
        course: courseSelectComponentValue.label,
        order: sessionSelectComponentValue.value,
        session: sessionSelectComponentValue.label,
      };
    });

    interactRun("UPDATE_RUN", sessionLastActiveRun._id, "running")
      .then((run) => {
        setTeacherContext({
          configurator: false,
          course: selectedCourse,
          session: selectedSession,
          steps: selectedSessionSteps,
          currentStep: null,
          currentRun: sessionLastActiveRun._id,
        });
      })
      .catch((e) => {
        prompt("no run");
      });
  };

  const onSubmitNewRun = (e) => {
    saveSession();

    if (sessionLastActiveRun)
      interactRun("UPDATE_RUN", sessionLastActiveRun._id, "done");

    SetUserRunningCourse(selectedCourse);
    setMenuContext((prev) => {
      return {
        ...prev,
        course: courseSelectComponentValue.label,
        order: sessionSelectComponentValue.value,
        session: sessionSelectComponentValue.label,
      };
    });

    interactRun("FINSIH_ALL_SESSION_RUNS", selectedSession).then((R) => {
      interactRun("NEW_RUN", selectedSession)
        .then((run) => {
          const params = {
            action: "RE_INIT_STEPS",
            status: "inactive",
            grade: "inactive",
          };
          interactSession(selectedSession, params)
            .then((response) => {
              reloadSession(selectedSession);
              setTeacherContext({
                course: selectedCourse,
                session: selectedSession,
                //steps: selectedSessionSteps,
                currentStep: null,
                currentRun: run,
              });
            })
            .catch((error) => {
              // setError("apiError", { message: error });
              console.log(error);
            });
        })
        .catch((error) => {
          // setError("apiError", { message: error });
          console.log(error);
        });
    });
  };

  return (
    <Container>
      <Row className="m-2 p-2 bg-light">
        <h3>Select a course</h3>
        <Col xs={12} sm={9} md={8}>
          <Select
            options={teacherCourses}
            onChange={handleSelectCourse}
            value={courseSelectComponentValue}
          />
        </Col>

        <Col xs={12} sm={3} md={4} className="align-self-center">
          <ButtonGroup className="p-1 m-1">
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-circle"
              onClick={handleNewCourse}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Button
              variant="outline-warning"
              size="sm"
              className="rounded-circle"
              onClick={handleEditCourse}
              disabled={!courseSelectComponentValue}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-circle"
              onClick={handleDeleteCourse}
              disabled={!courseSelectComponentValue}
            >
              <FontAwesomeIcon icon={faMinus} />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      <Row className="m-2 p-2 bg-light">
        <h3 className="mt-2">Select a session</h3>
        <Col xs={12} sm={9} md={8}>
          <Select
            options={courseSessions}
            onChange={(e) => handleSelectSession(e)}
            value={sessionSelectComponentValue}
          ></Select>
        </Col>
        <Col xs={3} sm={3} md={4} className="align-self-center">
          <ButtonGroup className="p-1 m-1">
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-circle"
              onClick={handleNewSession}
              disabled={!courseSelectComponentValue}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Button
              variant="outline-warning"
              size="sm"
              className="rounded-circle"
              disabled={
                !(courseSelectComponentValue && sessionSelectComponentValue)
              }
              onClick={handleEditSession}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-circle"
              disabled={
                !(courseSelectComponentValue && sessionSelectComponentValue)
              }
              onClick={handleDeleteSession}
            >
              <FontAwesomeIcon icon={faMinus} />
            </Button>
          </ButtonGroup>
          <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
        </Col>
        <Row>
          <Col xs={12} sm={9} md={8} className="align-self-center mt-2">
            {sessionSelectComponentValue && stepsData.length < 1 && (
              <Alert className="bg-danger text-white">
                <strong>This session has no steps!</strong> Please define some
                steps to be able to start a run
              </Alert>
            )}
            {sessionSelectComponentValue &&
              stepsData.length > 0 &&
              sessionLastActiveRun && (
                <Alert>
                  <strong>This session has a non finished run!</strong> You can
                  either resume that run or start a new
                </Alert>
              )}
            <Button
              className="mt-1"
              variant="success"
              data="yyyy"
              onClick={onSubmitNewRun}
              disabled={
                !(
                  sessionSelectComponentValue &&
                  courseSelectComponentValue &&
                  stepsData.length > 0
                )
              }
            >
              Start a new session run
            </Button>{" "}
            {"  "}
            {sessionLastActiveRun && (
              <Button
                className="mt-1"
                variant="success"
                data="wwwww"
                onClick={onSubmitResume}
              >
                Resume (
                <i>
                  Run of:{" "}
                  {moment(sessionLastActiveRun.beginDate).format(
                    "dddd, MMMM Do YYYY, h:mm:ss a"
                  )}
                  ;
                </i>
                )
              </Button>
            )}
          </Col>
        </Row>
      </Row>
      <Row className="m-2 p-2 bg-light">
        <Col xs={12} md={12} className="align-self-center mt-2 p-3">
          {/* <Col xs={10} md={10} className="p-3"> */}
          <Button
            className="ml-3 mb-2"
            onClick={toggleShowSteps}
            disabled={
              !(sessionSelectComponentValue && courseSelectComponentValue)
            }
          >
            {!showSteps ? "See/edit session steps" : "Hide steps details"}
          </Button>
          <br />
          {showSteps && (
            <SessionStepsDetails
              session={selectedSession}
              stepsData={stepsData}
              setStepsData={setStepsData}
              saveSession={saveSession}
              reloadSession={() => reloadSession(selectedSession)}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SessionConfigurator;
