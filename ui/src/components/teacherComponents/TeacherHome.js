import { createContext, useState } from "react";
import SessionConfigurator from "./SessionConfigurator";
import TeacherBoard from "./TeacherBoard";

export const TeacherContext = createContext({
  configurator: false,
  teacher: null,
  course: null,
  session: null,
  steps: [],
  currentStep: null,
  currentRun: null,
  runStatus: null,
  learnersSteps: [],
  learnersGrades: [],
  helpRequests: [],
  unlockRequests: [],
  timer: null,
  socket: null,
});

const TeacherHome = (props) => {
  const [teacherContext, setTeacherContext] = useState({
    configurator: true,
    teacher: props.username,
    course: null,
    session: null,
    steps: null,
    currentStep: null,
    currentRun: null,
    runStatus: null,
    learnersSteps: [],
    learnersGrades: [],
    helpRequests: [],
    unlockRequests: [],
    troubles: [],
    timer: null,
    socket: null,
  });

  return (
    <TeacherContext.Provider value={{ teacherContext, setTeacherContext }}>
      {(teacherContext.configurator || !teacherContext.currentRun) && (
        <SessionConfigurator />
      )}
      {!(teacherContext.configurator || !teacherContext.currentRun) && (
        <TeacherBoard />
      )}
    </TeacherContext.Provider>
  );
};

export default TeacherHome;
