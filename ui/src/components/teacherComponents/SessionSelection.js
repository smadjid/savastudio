import { useContext, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { interactRun } from "../../services/RunService";

import {
  getAllSessions,
  getAllSteps,
  getCourseSessions,
  getSessionSteps,
  interactSession,
} from "../../services/SessionService";
import { TeacherContext } from "./TeacherHome";

const SessionSelection = (props) => {
  const { show, toggleShow } = props;
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);

  const [courses, setCourses] = useState([{ value: "1", label: "Course" }]);
  const [courseSessions, setCourseSessions] = useState([]);
  const [steps, setSteps] = useState([]);
  const [selectedSessionSteps, setSelectedSessionSteps] = useState([]);
  const [selectedSession, setSelectedSession] = useState();

  const handleSelectCourse = () => {
    getAllSessions()
      .then((response) => {
        setCourseSessions([]);
        response.forEach((element) => {
          setCourseSessions((sessions) => [
            ...sessions,
            { value: element._id, label: element.title },
          ]);
        });

        // if (response === "ok") toggleShow();
      })
      .catch((error) => {
        // setError("apiError", { message: error });
        console.log(error);
      });
    // console.log(courseSessions);
  };

  const reloadSession = (session) => {
    getSessionSteps(session)
      .then((response) => {
        setSteps([]);
        setSelectedSessionSteps([]);
        response.forEach((element) => {
          setSteps((steps) => [
            ...steps,
            { value: element._id, label: element.title },
          ]);
          setSelectedSessionSteps((steps) => [...steps, element]);
        });

        // if (response === "ok") toggleShow();
      })
      .catch((error) => {
        // setError("apiError", { message: error });
        console.log(error);
      });
  };

  const handleSelectSession = (e) => {
    setSelectedSession(e.value);
    reloadSession(e.value);
  };

  const onSubmitResume = (e) => {
    interactRun("RELOAD_RUN", selectedSession).then((run) => {
      const params = {
        action: "STOP_ACTIVE_STEPS",
      };
      interactSession(selectedSession, params)
        .then((response) => {
          reloadSession(selectedSession);
          setTeacherContext({
            session: selectedSession,
            steps: selectedSessionSteps,
            currentStep: null,
            currentRun: run,
          });
        })
        .catch((error) => {
          // setError("apiError", { message: error });
          console.log(error);
        });
    });
    return;
  };

  const onSubmitNewRun = (e) => {
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
                session: selectedSession,
                steps: selectedSessionSteps,
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
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Select a session to launch</Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Select a course</Form.Label>
            <Select options={courses} onChange={handleSelectCourse} />
            <hr />
            <Form.Label>Select a session</Form.Label>
            <Select options={courseSessions} onChange={handleSelectSession} />
            {steps && (
              <Alert key={"success"} variant={"success"}>
                {" "}
                The selected session has <b>{steps.length} steps</b>{" "}
              </Alert>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" data="wwwww" onClick={onSubmitResume}>
            Resume (<i>from previous run</i>)
          </Button>
          <Button variant="dark" data="yyyy" onClick={onSubmitNewRun}>
            Start (<i>and delete previous run</i>)
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SessionSelection;
