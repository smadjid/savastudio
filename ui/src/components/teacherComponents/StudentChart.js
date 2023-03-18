import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { TeacherContext } from "./TeacherHome";
import { useContext, useEffect, useState } from "react";

//

const StudentChart = (props) => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    computeChartData();
  }, [props.selectedStudent]);

  const closeChart = () => {
    props.seeStudent(false);
  };

  const computeChartData = () => {
    setChartData([]);
    teacherContext.steps.forEach((element) => {
      let step = {
        name: "Step " + element.order,
        teacher: element.duration / 60,
        class: getClassStepValue(element._id) / 60,
        student: getStudentStepValue(element._id) / 60,
      };
      setChartData((prevData) => {
        return [...prevData, step];
      });
    });
  };

  const getStudentStepValue = (stepId) => {
    let stdData = teacherContext.learnersSteps.filter((step) => {
      return step.student === props.selectedStudent && step.stepID === stepId;
    });

    return stdData && stdData.length ? stdData[0].duration : null;
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

  return (
    <>
      <div
        className="badge bg-danger rounded-circle position-relative top-0 start-100 translate-middle"
        role={"button"}
        onClick={closeChart}
      >
        <FontAwesomeIcon icon={faXmark} color="white" size="2x" />
      </div>

      <ResponsiveContainer width={"90%"} height={"55%"}>
        <BarChart
          width={500}
          height={300}
          data={chartData}
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
    </>
  );
};
export default StudentChart;
