import React, { PureComponent } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faXmark,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { TeacherContext } from "./TeacherHome";
import { useContext, useEffect, useState } from "react";
import {
  Accordion,
  Badge,
  Button,
  ButtonGroup,
  Row,
  Tooltip,
} from "react-bootstrap";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Rating } from "react-simple-star-rating";

//

const StudentView = (props) => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [studentData, setStudentData] = useState([]);
  const [statView, setStatView] = useState(true);
  const [studentGrade, setStudentGrade] = useState(100);
  const [studentTroubles, setStudentTroubles] = useState([]);
  const [studentHelpRequests, setHelpRequests] = useState([]);
  const [studentUnlockRequests, setUnlockRequests] = useState([]);

  useEffect(() => {
    if(props.selectedStudent)
        computeStudentData();
  }, [props.selectedStudent, teacherContext]);

  const closeChart = () => {
    props.seeStudent(false);
  };

  const computeStudentData = () => {
    setStudentData([]);
    setStudentGrade(getStudentGrade());
    setStudentTroubles(getStudentTroubles());
    setHelpRequests(getStudentHelpRequests());
    setUnlockRequests(getStudentUnlockRequests());
    teacherContext.steps.forEach((element) => {
      const studentStep = getStudentStep(element._id);
      let status =
        studentStep.status === "done"
          ? studentStep.grade
          : studentStep.status === "active"
          ? "active"
          : "inactive";
      if (studentStep.status === "done") {
        status = studentStep.grade;
      }

      let step = {
        order: element.order,
        name: element.title,
        teacher: element.duration / 60,
        class: getClassStepValue(element._id) / 60,
        student: getStudentStepValue(element._id) / 60,
        status: status,
        studentRating: studentStep.rating
      };
      setStudentData((prevData) => {
        return [...prevData, step];
      });
    });
  };

  const getStudentStep = (stepId) => {
    let stdData = teacherContext.learnersSteps.filter((step) => {
      return step.student === props.selectedStudent && step.stepID === stepId;
    });

    return stdData && stdData.length ? stdData[0] : null;
  };

  const getStudentStepValue = (stepId) => {
    let stdData = teacherContext.learnersSteps.filter((step) => {
      return step.student === props.selectedStudent && step.stepID === stepId;
    });

    return stdData && stdData.length ? stdData[0].duration : null;
  };

  const getStudentGrade = () => {
    let stdData = teacherContext.learnersGrades.filter((gr) => {
      return gr.student === props.selectedStudent;
    });

    

    return stdData && stdData.length ? stdData[0].grade : null;
  };

  const getStudentTroubles = () => {
    let stdData = teacherContext.troubles.filter((tr) => {
      return tr.student === props.selectedStudent;
    });

    return stdData;
  };

  const getStudentHelpRequests = () => {
    let stdData = teacherContext.helpRequests.filter((tr) => {
      return tr.student === props.selectedStudent;
    });

    return stdData;
  };

  const getStudentUnlockRequests = () => {
    let stdData = teacherContext.unlockRequests.filter((tr) => {
      return tr.student === props.selectedStudent;
    });

    return stdData;
  };

  const getClassStepValue = (stepId) => {
    let stdData = teacherContext.learnersSteps.filter((step) => {
      return step.stepID === stepId;
    });
    return stdData && stdData.length
      ? stdData.reduce((total, next) => total + next.duration, 0) /
          stdData.length
      : null;
  };

  const getClassStepFromStudentStep = (stepId) => {
    let classStep = teacherContext.steps.filter((step) => {
        return step._id === stepId;
      });

    
    return classStep && classStep.length ? classStep[0]      : null;
  };

  return (
    <>
      <h5 className="position-relative">
        <ButtonGroup>
          <Button
            variant={!statView ? "secondary" : "dark"}
            onClick={() => setStatView(true)}
          >
            Overview
          </Button>
          <Button
            variant={statView ? "secondary" : "dark"}
            onClick={() => setStatView(false)}
          >
            Steps duration
          </Button>
        </ButtonGroup>
        <span className="badge bg-danger rounded position-absolute end-0 m-2">
          Score: {studentGrade  ? studentGrade.toFixed(2): ' '}
          
        </span>
      </h5>
      {statView && (
        <Row className="card text-dark mb-3 p-0  m-2">
          <div className="card-header bg-secondary text-white table-responsive">
            <h5>Learner's steps</h5>
            <table className="steps-control-table table   table-responsive">
              <tbody>
                <tr>
                  {studentData &&
                    studentData
                      .sort((a, b) => (a.order > b.order ? 1 : -1))
                      .map((step) => {
                        return (
                          <td className={`step ${step.status}`}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <Badge bg="dark">{step.order}</Badge>{" "}
                                {step.name}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                </tr>
                <tr>
                  {studentData &&
                    studentData
                      .sort((a, b) => (a.order > b.order ? 1 : -1))
                      .map((step) => {
                        return (
                          <td >
                            
                               <span> <Rating  initialValue={step.studentRating} size={15} readonly/></span>
                            
                          </td>
                        );
                      })}
                </tr>

                <tr>
                  {/* {learnerContext.studentSteps &&
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
                      else if (step.status === "active")
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
                    })} */}
                </tr>
              </tbody>
            </table>
          </div>
          <br/>
          <Accordion defaultActiveKey={["0"]} className="m-1" alwaysOpen flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <h5>
                  Trouble notifications{" "}
                  <Badge bg="info"> {studentTroubles.length} </Badge>
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                {studentTroubles.map((trouble) => {
                    const step = getClassStepFromStudentStep(trouble.stepID)
                    
                  const title = step? step.title : 'no title';
                 // return <h6 className="p-2 m-1">{title}</h6>;
                  if(step)
                    return <h6 className="p-2 m-1">Step {step.order}: <b>{title}</b> 
                    {trouble.status === "waiting"? <span className="m-2 p-1 bg-danger text-white"><i>Ongoing</i></span> : trouble.status === "cancelled"? <span className="m-2 p-1 bg-secondary text-white"><i>Fixed!</i></span>: ' '} </h6>
                })}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <h5>
                  Help seeking{" "}
                  <Badge bg="info"> {studentHelpRequests.length} </Badge>
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                {studentHelpRequests.map((help) => {
                  const step = getClassStepFromStudentStep(help.stepID)
                  const title = step? step.title : 'no title';
                  if(step)
                    return <h6 className="p-2 m-1">Step {step.order}: <b>{title}</b> 
                    {help.status === "waiting"? <span className="m-2 p-1 bg-primary text-white"><i>Waiting response</i></span> : 
                    help.status === "cancelled"? <span className="m-2 p-1 bg-secondary text-white"><i>Cancelled</i></span>: 
                    help.status === "answered"? <><span className="m-2 p-1 bg-success text-white"><i>Answered</i></span>
                     <Rating  initialValue={help.rating}  readonly/></>:
                     <></>}
                      </h6>
                 else
                 return <h6 className="p-2 m-1"><in>(No title)</in>  <Rating  initialValue={help.rating}  readonly/></h6>
                })}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <h5>
                  Step-Unlock Requests{" "}
                  <Badge bg="info"> {studentUnlockRequests.length} </Badge>
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                {studentUnlockRequests.map((unlock) => {
                  const step = getClassStepFromStudentStep(unlock.stepID)
                  const title = step? step.title : 'no title';
                  if(step)
                    return <h6 className="p-2 m-1">Step {step.order}: <b>{title}</b>
                    {unlock.status === "waiting"? <span className="m-2 p-1 bg-primary text-white"><i>Waiting response</i></span> : 
                    unlock.status === "cancelled"? <span className="m-2 p-1 bg-secondary text-white"><i>Cancelled</i></span>: 
                    unlock.status === "accepted"? <span className="m-2 p-1 bg-success text-white"><i>Accepted</i></span>: 
                    unlock.status === "refused"? <span className="m-2 p-1 bg-warning text-white"><i>Refused</i></span>: 
                    <span className="m-2 p-1 bg-secondary text-white"><i></i></span>} </h6>
                 else
                 return <h6 className="p-2 m-1"><in>(No title)</in>  <Rating  initialValue={unlock.rating}  readonly/></h6>
                })}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion> 
        </Row>
      )}
      {!statView && (
        <ResponsiveContainer width={"90%"} height={"55%"}>
          <BarChart
            width={500}
            height={300}
            data={studentData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis name="Time" unit={"mn"} />
            <Tooltip />
            <Legend />
            <Bar dataKey="teacher" fill="green" />
            <Bar dataKey="class" fill="brown" />
            <Bar dataKey="student" fill="blue" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};
export default StudentView;
