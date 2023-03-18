export async function getTeacherCourse(username) {
  const response = await fetch(`/api/course/${username}`, {
    method: "GET",
  });
  return await response.json();
}

export async function SetUserRunningCourse(courseid) {
  const response = await fetch(`/api/runningcourse/${courseid}`, {
    method: "GET",
    withCredentials: true
  });
  return await response;
}
export async function getLearnerCourse(username) {
  const response = await fetch(`/api/learnercourse/${username}`, {
    method: "GET",
  });
  return await response.json();
}

export async function getConnectedLearners(courseid) {
  const response = await fetch(`/api/connectedlearners/${courseid}`, {
    method: "GET",
    withCredentials: true
  });
  return await response.json();
}

export async function createNewCourse(username, title) {
  const action = "CREATE_NEW_COURSE";
  const params = { teacher: username, title: title };
  const response = await fetch(`/api/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, params: params }),
  });
  return await response.json();
}
export async function editCourse(id, newTitle) {
  const action = "EDIT_COURSE_TITLE";
  const params = { id: id, title: newTitle };
  const response = await fetch(`/api/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, params: params }),
  });
  return await response.json();
}

export async function disableCourse(id) {
  const action = "ENABLE_DISABLE_COURSE";
  const params = { id: id, disabled: true };
  const response = await fetch(`/api/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, params: params }),
  });
  return await response.json();
}

export async function createNewCourseSession(course, title) {
  const action = "CREATE_NEW_COURSE_SESSION";
  const params = { courseID: course, title: title };
  const response = await fetch(`/api/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, params: params }),
  });
  return await response.json();
}

export async function editCourseSession(id, newTitle) {
  const action = "EDIT_COURSE_SESSION_TITLE";
  const params = { id: id, title: newTitle };
  const response = await fetch(`/api/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, params: params }),
  });
  return await response.json();
}

export async function disableCourseSession(id) {
  const action = "ENABLE_DISABLE_SESSION";
  const params = { id: id, disabled: true };
  const response = await fetch(`/api/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, params: params }),
  });
  return await response.json();
}


