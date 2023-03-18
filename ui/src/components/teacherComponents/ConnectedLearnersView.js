import "./ConnectedLearnersView.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faMessage,
  faClock,
  faCheck,
  faCheckSquare,
  faUnlockAlt,
  faLock,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

import "bootstrap/dist/css/bootstrap.css";
import {
  Accordion,
  Badge,
  Button,
  Col,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import {
  DatatableWrapper,
  Filter,
  Pagination,
  PaginationOptions,
  TableBody,
  TableColumnType,
  TableHeader,
  useDatatableWrapper,
} from "react-bs-datatable";

import REQUEST_BODY from "../data.json";
import NO_REQUEST_BODY from "../nodata.json";
import { getConnectedLearners } from "../../services/CourseService";
import { TeacherContext } from "./TeacherHome";
import { useContext, useEffect, useState } from "react";
import {
  answerHelpRequest,
  answerUnlockRequest,
  rateHelpRequest,
} from "../../services/HelpService";
import moment from "moment";

import io from "socket.io-client";
import Swal from "sweetalert2";
import { Rating } from "react-simple-star-rating";

type ArrayRequestElementType = (typeof REQUEST_BODY)[number] & {
  img: any,
};

type ArrayNoRequestElementType = (typeof NO_REQUEST_BODY)[number] & {
  img: any,
};

var percentColors = [
  { pct: 0.0, color: { r: 255, g: 255, b: 255 } },
  { pct: 0.5, color: { r: 200, g: 0, b: 0 } },
  { pct: 1.0, color: { r: 0, g: 0, b: 0 } },
];

var getColorForPercentage = function (pctage) {
  let pct = pctage / 100;
  for (var i = 1; i < percentColors.length - 1; i++) {
    if (pct < percentColors[i].pct) {
      break;
    }
  }
  var lower = percentColors[i - 1];
  var upper = percentColors[i];
  var range = upper.pct - lower.pct;
  var rangePct = (pct - lower.pct) / range;
  var pctLower = 1 - rangePct;
  var pctUpper = rangePct;
  var color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };

  return "rgb(" + [color.r, color.g, color.b].join(",") + ")";
  // or output as hex if preferred
};
const RatingDialog = (props) => {
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Rate this question</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>You can provide a rating for this question</h5>
        <Rating
          fillColorArray={[
            "#f14f45",
            "#f16c45",
            "#f18845",
            "#f1b345",
            "#f1d045",
          ]}
          initialValue={3}
          onClick={props.handleRating}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={props.handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Then, use it in a component.
const ConnectedLearnersView = (props) => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  // const [learnersSteps,setLearnersSteps] = useState(null)
  // const [helpRequests,setHelpRequests] = useState(null)
  const [connectedLearners, setConnectedLearners] = useState([]);
  const [learnersHelpReq, setLearnersHelpReq] = useState([]);
  const [learnersUnlockReq, setLearnersUnlockReq] = useState([]);
  const [learnersTroubles, setLearnersTroubles] = useState([]);
  const [learnersDataNoReq, setLearnersDataNoReq] = useState([]);
  const [disconnectedLearnersData, setDisconnectedLearnersData] = useState([]);
  const [showRatingDlg, setShowRatingDlg] = useState(false);
  const [rating, setRating] = useState(3);
  const [hRequestToRate, setHRequestToRate] = useState(null);

  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    getConnectedLearners(teacherContext.course).then((learners) => {
      setConnectedLearners(learners);
      computeLearnersData();
    });
    //console.log('teacherContext:', teacherContext)
  }, [teacherContext]);
  
    useEffect(() => {
    const interval = setInterval(() => {
      updateRequestTime()
      //computeLearnersData();
    }, 1000);
    return () => clearInterval(interval);
  });

  const computeSpecificLearnersData = (
    username,
    steps,
    hrequests,
    urequests,
    troubles
  ) => {
    let currentStep = steps.filter((s) => s.status === "active");
    if (currentStep.length > 0) currentStep = currentStep[0];
    else currentStep = null;

    //console.log("currentStep:", currentStep)

    let currentHRequest = hrequests.filter((s) => s.status === "waiting");
    let currentTrouble = troubles.filter((s) => s.status === "waiting");

    let answeredHRequests = hrequests.filter((s) => s.status === "answered");
    let cancelHRequests = hrequests.filter((s) => s.status === "cancelled");
    let hrequestId = null;
    let hrequesting = false;
    let time_hrequesting = 0;
    if (currentHRequest.length > 0) {
      currentHRequest = currentHRequest[0];
      hrequestId = currentHRequest._id;

      hrequesting = true;
      let time_now = moment(new Date());
      time_hrequesting = moment.duration(
        time_now.diff(moment(currentHRequest.date))
      );
      time_hrequesting = moment
        .utc(time_hrequesting.asMilliseconds())
        .format("mm:ss");
    }

    let troubleTime = null
    if (currentTrouble.length > 0) {
      let time_trouble = null
      currentTrouble = currentTrouble[0];
      let time_now = moment(new Date());
      time_trouble = moment.duration(
        time_now.diff(moment(currentTrouble.date))
      );
      
      troubleTime = moment
        .utc(time_trouble.asMilliseconds())
        .format("mm:ss");

    } else currentTrouble = null;

    let currentURequest = urequests.filter((s) => s.status === "waiting");
    let answeredURequests = urequests.filter((s) => s.status === "answered");
    let cancelURequests = urequests.filter((s) => s.status === "cancelled");
    let urequestId = null;
    let urequestOrder = null;
    let urequesting = false;
    let time_urequesting = 0;
    if (currentURequest.length > 0) {
      currentURequest = currentURequest[0];
      urequestId = currentURequest._id;
      urequestOrder = currentURequest.stepOrder;

      urequesting = true;
      let time_now = moment(new Date());
      time_urequesting = moment.duration(
        time_now.diff(moment(currentURequest.date))
      );
      time_urequesting = moment
        .utc(time_urequesting.asMilliseconds())
        .format("mm:ss");
    }

    const learner = {
      username: username,
      all_hrequests: hrequests.length,
      hrequesting: hrequesting,
      hrequest_id: hrequestId,
      time_hrequesting: time_hrequesting,
      date_hrequesting: currentHRequest? currentHRequest.date: null,
      answeredHRequests: answeredHRequests.length,
      cancelHRequests: cancelHRequests.length,
      all_urequests: urequests.length,
      urequesting: urequesting,
      urequest_id: urequestId,
      urequest_order: urequestOrder,
      date_urequesting: currentURequest ? currentURequest.date:null,
      time_urequesting: time_urequesting,
      answeredURequests: answeredURequests.length,
      cancelURequests: cancelURequests.length,
      trouble: currentTrouble,
      time_trouble: troubleTime,
      date_trouble: (currentTrouble ? currentTrouble.date: null),
      currentStep: currentStep,
      stepsStats: null,
      grade: 100,
    };

    return learner;
  };

  const updateRequestTime = () =>{
    let updatedLearnersHelpReq = []
    learnersHelpReq.map((currentHRequest)=>{
      
      let time_now = moment(new Date());
      let time_hrequesting = moment.duration(
        time_now.diff(moment(currentHRequest.date_hrequesting))
      );
      time_hrequesting = moment
        .utc(time_hrequesting.asMilliseconds())
        .format("mm:ss");
      currentHRequest.time_hrequesting = time_hrequesting
      updatedLearnersHelpReq.push(currentHRequest)
    }
    )
    setLearnersHelpReq(updatedLearnersHelpReq);

    ///////////////////////////////////
    let updatedLearnersUReq = []
    learnersUnlockReq.map((currentURequest)=>{
      
      let time_now = moment(new Date());
      let time_urequesting = moment.duration(
        time_now.diff(moment(currentURequest.date_urequesting))
      );
      time_urequesting = moment
        .utc(time_urequesting.asMilliseconds())
        .format("mm:ss");
        currentURequest.time_urequesting = time_urequesting
      updatedLearnersUReq.push(currentURequest)
    }
    )
    setLearnersUnlockReq(updatedLearnersUReq);

    /////////////////////
    let updatedTroubles = []
    //console.log(learnersTroubles)
    learnersTroubles .map((currentTrouble)=>{
      
      let time_now = moment(new Date());
      let time_trouble = moment.duration(
        time_now.diff(moment(currentTrouble.date_trouble))
      );
      time_trouble = moment
        .utc(time_trouble.asMilliseconds())
        .format("mm:ss");
        currentTrouble.time_trouble = time_trouble
        updatedTroubles.push(currentTrouble)
    }
    )
    setLearnersTroubles(updatedTroubles);
  }

  const onAnswerHelpRequest = (row) => {
    const params = {
      action: "ANSWER_HELP_REQUEST",
      helpID: row.hrequest_id,
    };
    setHRequestToRate(row.hrequest_id);
    answerHelpRequest(params)
      .then((response) => {
        setShowRatingDlg(true);
        socket.emit("updated", teacherContext.currentRun);
      })
      .catch((e) => console.log("Error answering help request"));
  };

  const onAnswerUnlockRequest = (row, status) => {
    const params = {
      action: "ANSWER_UNLOCK_REQUEST",
      unlockID: row.urequest_id,
      status: status,
    };
    answerUnlockRequest(params)
      .then((response) => console.log(response))
      .catch((e) => console.log("Error answering UNLOCK request"));
    socket.emit("updated", teacherContext.currentRun);
  };

  const computeLearnersData = () => {
    let learnerNames = [];

    if (
      !teacherContext.learnersSteps ||
      teacherContext.learnersSteps.length < 1
    )
      return;

    teacherContext.learnersSteps.map((step) => {
      if (learnerNames.indexOf(step.student) === -1) {
        learnerNames.push(step.student);
      }
    });

    if (learnerNames.length > 0) {
      //// Connected learners
      const connectOnlyLearners = learnerNames.filter((l) =>
        connectedLearners.includes(l)
      );
      setLearnersHelpReq([]);
      setLearnersUnlockReq([]);
      setLearnersTroubles([]);
      setLearnersDataNoReq([]);

      connectOnlyLearners.map((username) => {
        const steps = teacherContext.learnersSteps.filter(
          (step) => step.student === username
        );
        const hrequests = teacherContext.helpRequests.filter(
          (step) => step.student === username
        );

        const troubles = teacherContext.troubles.filter(
          (step) => step.student === username
        );

        const urequests = teacherContext.unlockRequests.filter(
          (step) => step.student === username
        );

        let gradeItems = teacherContext.learnersGrades.filter(
          (step) => step.student === username
        );

        const grade = gradeItems.length > 0 ? gradeItems[0].grade : 100;

        const learner = computeSpecificLearnersData(
          username,
          steps,
          hrequests,
          urequests,
          troubles,
          grade
        );
        learner.grade = grade;

        if (learner.hrequesting)
          setLearnersHelpReq((prev) => {
            return [...prev, learner];
          });
        if (learner.trouble)
          setLearnersTroubles((prev) => {
            return [...prev, learner];
          });

        setLearnersHelpReq((prev) => {
          return prev.sort((a, b) =>
            a.time_hrequesting < b.time_hrequesting ? 1 : -1
          );
        });

        if (learner.urequesting)
          setLearnersUnlockReq((prev) => {
            return [...prev, learner];
          });

        setLearnersUnlockReq((prev) => {
          return prev.sort((a, b) =>
            a.time_urequesting < b.time_urequesting ? 1 : -1
          );
        });

        if (!learner.hrequesting && !learner.urequesting)
          setLearnersDataNoReq((prev) => {
            return [...prev, learner];
          });
      });

      //// Connected learners
      const disconnectedLearners = learnerNames.filter(
        (l) => !connectedLearners.includes(l)
      );
      setDisconnectedLearnersData([]);

      disconnectedLearners.map((username) => {
        const steps = teacherContext.learnersSteps.filter(
          (step) => step.student === username
        );
        const hrequests = teacherContext.helpRequests.filter(
          (step) => step.student === username
        );

        const urequests = teacherContext.unlockRequests.filter(
          (step) => step.student === username
        );

        const troubles = teacherContext.troubles.filter(
          (step) => step.student === username
        );

        const gradeItems = teacherContext.learnersGrades.filter(
          (step) => step.student === username
        );
        const grade = gradeItems.length > 0 ? gradeItems[0].grade : 100;

        const learner = computeSpecificLearnersData(
          username,
          steps,
          hrequests,
          urequests,
          troubles,
          grade
        );
        learner.grade = grade;

        setDisconnectedLearnersData((prev) => {
          return [...prev, learner];
        });
      });
    } else console.log("no learners");
  };

  const HELP_REQUEST_HEADERS: TableColumnType<ArrayRequestElementType>[] = [
    {
      prop: "name",
      isFilterable: true,
      cell: (row) => (
        <>
          <FontAwesomeIcon
            size="2x"
            icon={faUserCircle}
            color={getColorForPercentage(row.grade)}
          ></FontAwesomeIcon>{" "}
          &nbsp;&nbsp;
          <span role={"button"}>{row.username}</span>
          <br />
          <Badge bg="secondary">
            {" "}
            <i>Step {row.currentStep ? row.currentStep.order : " - "}</i>
          </Badge>
        </>
      ),
    },
    {
      prop: "button",

      cell: (row) => (
        <Button
          variant="success"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAnswerHelpRequest(row);
          }}
        >
          Answer &nbsp;&nbsp;
          <FontAwesomeIcon
            size="x"
            icon={faCheckSquare}
            color="white"
          ></FontAwesomeIcon>
        </Button>
      ),
    },
    {
      prop: "date",
      isSortable: true,
      cell: (row) => (
        <>
          <kbd style={{ backgroundColor: "gray", color: "white" }}>
            <FontAwesomeIcon icon={faClock} /> {row.time_hrequesting}
          </kbd>
        </>
      ),
    },
    {
      prop: "answeredRequests",
      title: "Nb messages",
      isFilterable: true,
      isSortable: false,
    },
  ];

  const TROUBLE_HEADERS: TableColumnType<ArrayRequestElementType>[] = [
    {
      prop: "name",
      isFilterable: true,
      cell: (row) => (
        <>
          <FontAwesomeIcon
            size="2x"
            icon={faUserCircle}
            color={getColorForPercentage(row.grade)}
          ></FontAwesomeIcon>{" "}
          &nbsp;&nbsp;
          <span role={"button"}>{row.username}</span> <br />
          <Badge bg="secondary">
            {" "}
            <i>Step {row.currentStep ? row.currentStep.order : " - "}</i>
          </Badge>
        </>
      ),
    },
    {
      prop: "date",
      isSortable: true,
      cell: (row) => (
        <>
          <kbd style={{ backgroundColor: "gray", color: "white" }}>
            <FontAwesomeIcon icon={faClock} /> {row.time_trouble}
          </kbd>
        </>
      ),
    },
    {
      prop: "answeredRequests",
      title: "Nb messages",
      isFilterable: true,
      isSortable: false,
    },
  ];

  const UNLOCK_REQUEST_HEADERS: TableColumnType<ArrayRequestElementType>[] = [
    {
      prop: "name",
      isFilterable: true,
      cell: (row) => (
        <>
          <FontAwesomeIcon
            size="2x"
            icon={faUserCircle}
            color={getColorForPercentage(row.grade)}
          ></FontAwesomeIcon>{" "}
          &nbsp;&nbsp;
          <span role={"button"}>{row.username}</span> <br />
          <Badge bg="secondary">
            {" "}
            <i>Step {row.currentStep ? row.currentStep.order : " - "}</i>
          </Badge>
        </>
      ),
    },
    {
      prop: "button",

      cell: (row) => (
        <>
          <div className="bg-primary text-white p-0 m-0">
            {row.urequest_order}
          </div>
        </>
      ),
    },
    {
      prop: "button",

      cell: (row) => (
        <>
          <FontAwesomeIcon
            size="x"
            icon={faUnlock}
            color="green"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnswerUnlockRequest(row, "accepted");
            }}
          />
          &nbsp;&nbsp;
          <FontAwesomeIcon
            size="x"
            icon={faLock}
            color="red"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnswerUnlockRequest(row, "refused");
            }}
          />
        </>
      ),
    },
    {
      prop: "date",
      isSortable: true,
      cell: (row) => (
        <>
          <kbd style={{ backgroundColor: "gray", color: "white" }}>
            <FontAwesomeIcon icon={faClock} /> {row.time_urequesting}
          </kbd>
        </>
      ),
    },
    {
      prop: "answeredRequests",
      title: "Nb messages",
      isFilterable: true,
      isSortable: false,
    },
  ];

  const NO_REQUEST_HEADERS: TableColumnType<ArrayNoRequestElementType>[] = [
    {
      prop: "name",
      isFilterable: true,
      cell: (row) => (
        <>
          <FontAwesomeIcon
            size="2x"
            icon={faUserCircle}
            color={getColorForPercentage(row.grade)}
          ></FontAwesomeIcon>{" "}
          &nbsp;&nbsp;
          <span role={"button"}>{row.username}</span>
          <br />
          <Badge bg="secondary">
            {" "}
            <i>Step {row.currentStep ? row.currentStep.order : " - "}</i>
          </Badge>
        </>
      ),
    },
    {
      prop: "button",
      cell: (row) => (
        <Button
          hidden
          variant="success"
          size="sm"
          onClick={() => {
            alert(`${row.name}'s score is ${row.score}`);
          }}
        >
          Answer &nbsp;&nbsp;
          <FontAwesomeIcon
            size="x"
            icon={faMessage}
            color="white"
          ></FontAwesomeIcon>
        </Button>
      ),
    },

    {
      prop: "answeredRequests",
      title: "Nb messages",
      isFilterable: true,
      isSortable: false,
    },
  ];

  const onRowClick = (e) => {
    props.seeStudent(true, e.username);
  };

  const closeRatingDlg = () => {
    if (hRequestToRate) {
      const params = {
        action: "ANSWER_HELP_REQUEST",
        helpID: hRequestToRate,
        rating: rating,
      };
      // console.log('question id:', hRequestToRate,' - its rating was:', rating)
      rateHelpRequest(params)
        .then((response) => socket.emit("updated", teacherContext.currentRun))
        .catch((e) => console.log("Error rating help request"));
    }
    setHRequestToRate(null);
    setRating(3);
    setShowRatingDlg(false);
  };

  // Catch Rating value
  const handleRating = (rate: number) => {
    setRating(rate);

    // other logic
  };
  return (
    <div className="connected-learners  shadow-lg p-0 border-secondary rounded  border ">
      <div className="card-header bg-dark p-2 text-light">
        <h5>Learners & requests</h5>
        <RatingDialog
          show={showRatingDlg}
          handleClose={closeRatingDlg}
          handleSave={closeRatingDlg}
          handleRating={handleRating}
        />
      </div>
      <div className=" p-2">
        <Accordion defaultActiveKey={["0"]} className="m-0 p-0" alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header className=" tg-0lax  text-white">
              <span className="m-2">
                <i>Help-Seeking Requests </i>
              </span>{" "}
              <Badge bg="primary">
                {" "}
                <b>{learnersHelpReq.length} </b>
              </Badge>
              {learnersHelpReq.length >0 &&<div
                className="spinner-grow ms-auto bg-primary"
                role="status"
                aria-hidden="true"
              />}
            </Accordion.Header>
            <Accordion.Body className="m-0 p-0">
              {learnersHelpReq.length > 0 && (
                <DatatableWrapper
                  headers={HELP_REQUEST_HEADERS}
                  body={learnersHelpReq}
                  sortProps={{ initialState: { order: "desc", prop: "date" } }}
                >
                  <Table>
                    <TableBody
                      onRowClick={onRowClick}
                      rowProps={(row) => {
                        if (
                          props.studentView &&
                          row.username === props.selectedStudent
                        )
                          return {
                            style: {
                              background: "#eaeced",
                            },
                          };
                        else
                          return {
                            style: {
                              background: "#ffe4e4",
                            },
                          };
                      }}
                    />
                  </Table>
                </DatatableWrapper>
              )}
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <span className="m-2">
                <i>Step-Unlock Requests</i>
                {"  "}
              </span>{" "}
              <span className="display-8">
                <Badge bg="warning">
                  {" "}
                  <b>{learnersUnlockReq.length} </b>
                </Badge>
              </span>
              {learnersUnlockReq.length >0 &&<div
                className="spinner-grow ms-auto bg-warning"
                role="status"
                aria-hidden="true"
              />}
            </Accordion.Header>
            <Accordion.Body className="m-0 p-0">
              {learnersUnlockReq.length > 0 && (
                <DatatableWrapper
                  headers={UNLOCK_REQUEST_HEADERS}
                  body={learnersUnlockReq}
                >
                  {/* <Filter className="button" placeholder="Filter learners ..." />
        <hr /> */}
                  <Table>
                    <TableBody
                      onRowClick={onRowClick}
                      rowProps={(row) => {
                        if (
                          props.studentView &&
                          row.username === props.selectedStudent
                        )
                          return {
                            style: {
                              //background: `rgba(128, 0, 0, ${row.score / 200})`
                              background: "#eaeced",
                            },
                          };
                        else
                          return {
                            style: {
                              //background: `rgba(128, 0, 0, ${row.score / 200})`
                              background: "#f7efe8",
                            },
                          };
                      }}
                    />
                  </Table>
                </DatatableWrapper>
              )}
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <span className="m-2">
                <i>Currently in trouble</i>
              </span>
              <Badge bg="danger">
                {" "}
                <b>{learnersTroubles.length} </b>
              </Badge>
              {learnersTroubles.length >0 &&<div
                className="spinner-grow ms-auto bg-danger"
                role="status"
                aria-hidden="true"
              />}
            </Accordion.Header>
            <Accordion.Body className="m-0 p-0">
              {learnersTroubles.length > 0 && (
                <DatatableWrapper
                  headers={TROUBLE_HEADERS}
                  body={learnersTroubles}
                >
                  {/* <Filter className="button" placeholder="Filter learners ..." />
        <hr /> */}
                  <Table>
                    <TableBody
                      onRowClick={onRowClick}
                      rowProps={(row) => {
                        if (
                          props.studentView &&
                          row.username === props.selectedStudent
                        )
                          return {
                            style: {
                              //background: `rgba(128, 0, 0, ${row.score / 200})`
                              background: "#eaeced",
                            },
                          };
                        else
                          return {
                            style: {
                              //background: `rgba(128, 0, 0, ${row.score / 200})`
                              background: "#f7efe8",
                            },
                          };
                      }}
                    />
                  </Table>
                </DatatableWrapper>
              )}
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="3">
            <Accordion.Header>
              <span className="m-2">
                <i>Connected learners - no request </i>
              </span>
              <Badge bg="secondary">
                {" "}
                <b>{learnersDataNoReq.length} </b>
              </Badge>
            </Accordion.Header>
            <Accordion.Body className="m-0 p-0">
              <DatatableWrapper
                headers={NO_REQUEST_HEADERS}
                body={learnersDataNoReq}
              >
                <div hidden>
                  <Filter
                    className="button"
                    placeholder="Filter learners ..."
                  />
                </div>
                {learnersDataNoReq.length > 0 && (
                  <Table>
                    <TableBody
                      onRowClick={onRowClick}
                      rowProps={(row) => {
                        if (
                          props.studentView &&
                          row.username === props.selectedStudent
                        )
                          return {
                            style: {
                              //background: `rgba(128, 0, 0, ${row.score / 200})`
                              background: "#eaeced",
                            },
                          };
                      }}
                    ></TableBody>
                  </Table>
                )}
              </DatatableWrapper>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="4">
            <Accordion.Header>
              <span className="m-2">
                <i>Disconnected learners</i>
              </span>{" "}
              <Badge bg="secondary">
                {" "}
                <b>{disconnectedLearnersData.length} </b>
              </Badge>
            </Accordion.Header>
            <Accordion.Body className="m-0 p-0">
              <DatatableWrapper
                headers={NO_REQUEST_HEADERS}
                body={disconnectedLearnersData}
              >
                <div hidden>
                  <Filter
                    className="button"
                    placeholder="Filter learners ..."
                  />
                </div>
                {disconnectedLearnersData.length > 0 && (
                  <Table>
                    <TableBody
                      onRowClick={onRowClick}
                      rowProps={(row) => {
                        if (
                          props.studentView &&
                          row.username === props.selectedStudent
                        )
                          return {
                            style: {
                              //background: `rgba(128, 0, 0, ${row.score / 200})`
                              background: "#eaeced",
                            },
                          };
                      }}
                    ></TableBody>
                  </Table>
                )}
              </DatatableWrapper>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};

export default ConnectedLearnersView;
