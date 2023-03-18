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
  BarChart,
  Bar,
  Cell,
  LabelList,
  Text,
} from "recharts";
import { Spinner } from "react-bootstrap";

const StepStats = (props) => {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    const data = payload[0].payload;

    let onTimeStudents = data.OnTimeStudents;
    let overdueStudents = data.OverdueStudents;
    let dropOutStudents = data.DropOutStudents;

    // payload.map(c => {
    //   console.log(c)
    // })
    return (
      <div className="custom-tooltip">
        <h6>{label}</h6>
        <ul class="list-group">
          <li class="list-group-item list-group-item-success">
            OnTime (
            {onTimeStudents.length > 0 ? onTimeStudents.length : "no student"}){" "}
            {onTimeStudents.length > 0 && (
              <strong className="label">: {onTimeStudents}</strong>
            )}
          </li>
          <li class="list-group-item list-group-item-warning">
            Overdue (
            {overdueStudents.length > 0 ? overdueStudents.length : "no student"}
            )
            {overdueStudents.length > 0 && (
              <strong className="label"> : {overdueStudents}</strong>
            )}
          </li>
          <li class="list-group-item list-group-item-danger">
            DropOut (
            {dropOutStudents.length > 0 ? dropOutStudents.length : "no student"}
            )
            {dropOutStudents.length > 0 && (
              <strong className="label">: {dropOutStudents}</strong>
            )}
          </li>
        </ul>
      </div>
    );
  }

  return <strong>Nothing to show</strong>;
};

const CustomLabel = (props) => {
  return;
  
  if (props.fill === "#6e8cf0") return <b>Ongoing</b>;
  return (
    <g>
      <rect
        x={props.viewBox.x}
        y={props.viewBox.y}
        fill="#aaa"
        width={100}
        height={30}
      />
      <text x={props.viewBox.x} y={props.viewBox.y} fill="#111" dy={20} dx={30}>
        {props.value}
      </text>
    </g>
  );
};

const ClassStateChart = () => {
  const { teacherContext, setTeacherContext } = useContext(TeacherContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    //console.log("Detected teacher context  change");
    computeChartData();
  }, [teacherContext]);

  const computeChartData = () => {
    if (
      !teacherContext.learnersSteps ||
      teacherContext.learnersSteps.length < 1
    )
      return null;

    setChartData([]);

    let students = teacherContext.learnersSteps.map((step) => step.student);
    // unique students
    students = [...new Set(students)];
    students.map((student) => {
      let std_steps = {
        student: student,
      };
      let stepStatus = [];

      const nSteps =
        teacherContext.steps && teacherContext.steps.length > 0
          ? teacherContext.steps.length
          : 0;
      if (nSteps)
        for (let i = 1; i <= nSteps; i++) {
          const step = teacherContext.steps.filter((step) => step.order === i);
          if (!step || step.length < 1) continue;
          const stepId = step[0]._id;
          const grade = getStudentStepGrade(student, stepId);
          if (grade) {
            std_steps[i] = 1;
            stepStatus.push(grade);
          }
        }
      std_steps.stepStatus = stepStatus;
      setChartData((prevData) => {
        return [...prevData, std_steps];
      })
    });
  };

  const getStudentStepGrade = (student, stepId) => {
    let studentData = teacherContext.learnersSteps.filter((step) => {
      return (
        step.student === student &&
        step.stepID === stepId &&
        step.status !== "inactive"
      );
    });
    if (studentData.length > 0) {
      if (studentData[0].status === "active") return "active";
      else return studentData[0].grade;
    } else return null;
  };

  function formatXAxis(value) {
    if (value) return "Step " + value;
    else return "";
  }

  let keys = [];
  if (teacherContext.steps && teacherContext.steps.length > 0)
    keys = Array.from({ length: teacherContext.steps.length }, (_, i) => i + 1);

  return (
    <>
      {(!teacherContext.learnersSteps ||
        teacherContext.learnersSteps.length < 1) && (
        <h2 width={"90%"} height={"60%"}>
          <Spinner animation="grow" /> Waiting students data...
        </h2>
      )}
      {teacherContext.learnersSteps && teacherContext.learnersSteps.length > 0 && (
        <ResponsiveContainer
          width={"100%"}
          height={"60%"}
          className="class-teacher-state"
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 40, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="1 1" stroke="lightgray" />
            <XAxis
              type="number"
              allowDecimals={false}
              tickFormatter={formatXAxis}
              interval={0}
              tickCount={teacherContext.learnersSteps.length}
              domain={[0, 'dataMax']} 
            />
            <YAxis type="category" dataKey="student" />
            {keys.map((key, index: number): any => {
              const bars = [];
              bars.push(
                <Bar
                  isAnimationActive={false}
                  label=<CustomLabel />
                  dataKey={key}
                  stackId="a"
                  onClick={(data: any, i: number) =>
                    console.log("Clicked: ", i, "is", data)
                  }
                >
                  {chartData.map((entry) => (
                    <Cell
                      stroke="white"
                      strokeWidth={0.5}
                      fill={
                        entry.stepStatus[index] === "success"
                          ? "#70c28f"
                          : entry.stepStatus[index] === "warning"
                          ? "#f7ad4d"
                          : entry.stepStatus[index] === "issue"
                          ? "#eb7a7a"
                          : entry.stepStatus[index] === "active"
                          ? "#7f9bf882"
                          : ""
                      }
                    ></Cell>
                  ))}
                  {/* <LabelList /> */}
                </Bar>
              );

              return bars;
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );

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
          <BarChart width={500} height={300} data={chartData}>
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
              tickFormatter={formatXAxis}
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
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default ClassStateChart;
