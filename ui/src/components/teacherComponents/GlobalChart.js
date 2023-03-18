import React, { PureComponent } from "react";
import { TeacherContext } from "./TeacherHome";
import { useContext, useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Spinner } from "react-bootstrap";

const StepStats = (props) => {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    const data = payload[0].payload;

    let onTimeStudents = data.OnTimeStudents;
    let overdueStudents = data.OverdueStudents;
    let dropOutStudents = data.DropOutStudents;

    return (
      <div className="custom-tooltip">
        <h6>{label}</h6>
        <ul class="list-group">
          <li class="list-group-item list-group-item-success">
            OnTime
            {onTimeStudents.length > 0 ? ' ' : " (no student)"}{" "}
            {onTimeStudents.length > 0 && (
              <strong className="label">: {onTimeStudents}</strong>
            )}
          </li>
          <li class="list-group-item list-group-item-warning">
            Overdue
            {overdueStudents.length > 0 ? ' ' : "(no student)"}{" "}            
            {overdueStudents.length > 0 && (
              <strong className="label"> : {overdueStudents}</strong>
            )}
          </li>
          <li class="list-group-item list-group-item-danger">
            DropOut 
            {dropOutStudents.length > 0 ? ' ' : "(no student)"}{" "}            
            {dropOutStudents.length > 0 && (
              <strong className="label">: {dropOutStudents}</strong>
            )}
          </li>
        </ul>
      </div>
    );
  }

  return <strong>Nothing</strong>;
};

//export default class GlobalChart extends PureComponent {
const GlobalChart = () => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    computeChartData();
  }, [teacherContext]);

  const computeChartData = () => {
    setChartData([]);
    if (teacherContext.steps && teacherContext.steps.length > 0)
      teacherContext.steps.forEach((element) => {
        let step = {
          //name: "Step "+element.order,
          name: element.title,
          helpRequests: getStepReqStats(element._id),
          OnTime: getStepGradeStats(element._id, "success"),
          OnTimeStudents: getStepGradeStudents(element._id, "success").join(' - '),
          Overdue: getStepGradeStats(element._id, "warning"),
          OverdueStudents: getStepGradeStudents(element._id, "warning").join(' - '),
          DropOut: getStepGradeStats(element._id, "issue"),
          DropOutStudents: getStepGradeStudents(element._id, "issue").join(' - ')
        };
        setChartData((prevData) => {
          return [...prevData, step];
        });
      });
  };

  const getStepGradeStats = (stepId, grade) => {
    if (
      !teacherContext.learnersSteps ||
      teacherContext.learnersSteps.length < 1
    )
      return null;
    let stepData = teacherContext.learnersSteps.filter((step) => {
      return (
        step.stepID === stepId && step.status === "done" && step.grade === grade
      );
    });
    return stepData ? stepData.length : null;
  };

  const getStepGradeStudents = (stepId, grade) => {
    if (
      !teacherContext.learnersSteps ||
      teacherContext.learnersSteps.length < 1
    )
      return null;
    let stepData = teacherContext.learnersSteps.filter((step) => {
      return (
        step.stepID === stepId && step.status === "done" && step.grade === grade
      );
    });
    stepData = stepData.map((step) => step.student);
    return stepData ? stepData : [];
  };

  const getStepReqStats = (stepId) => {
    if (!teacherContext.helpRequests || teacherContext.helpRequests.length < 1)
      return null;
    let learnerStepIds = teacherContext.learnersSteps.filter((req) => {
      return req.stepID === stepId;
    });

    const uniques = learnerStepIds
      .map((item) => item._id)
      .filter((value, index, self) => self.indexOf(value) === index);
    let stepData = teacherContext.helpRequests.filter((req) => {
      return (
        
        uniques.includes(req.stepID)
      );
    });
    return stepData ? stepData.length : null;
  };

  function formatYAxis(value) {
    if (value) return value + " Req";
    else return "";
  }

  return (
    <>
      {(!teacherContext.learnersSteps ||
        teacherContext.learnersSteps.length < 1) && (
        <h2 width={"90%"} height={"60%"}>
          <Spinner animation="grow" /> Waiting students data...
        </h2>
      )}
      {teacherContext.learnersSteps && teacherContext.learnersSteps.length > 0 && (
        <ResponsiveContainer width={"90%"} height={"60%"}>
          <LineChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              xAxisId="0"
              dataKey="name"
              padding={{ left: 30, right: 30 }}
            />
            <XAxis
              xAxisId="1"
              tickLine={false}
              tickMargin={-5}
              axisLine={false}
              dataKey="helpRequests"
              mirror={false}
              padding={{ left: 30, right: 30 }}
              stroke="#8884d8"
              tickFormatter={formatYAxis}
            />
            <YAxis interval={0} />
            <Tooltip content={<StepStats />} />
            <Legend />

            <Line type="monotone" dataKey="OnTime" stroke="#82ca9d" />
            <Line
              type="monotone"
              dataKey="Overdue"
              stroke="orange"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="DropOut"
              stroke="red"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default GlobalChart;
