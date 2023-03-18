export async function getAllSessions() {
  const response = await fetch("/api/sessions");
  return await response.json();
}
export async function getAllSteps() {
  const response = await fetch("/api/steps");
  return await response.json();
}

export async function getCourseSessions(courseID) {
  const response = await fetch(`/api/sessions/${courseID}`, {
    method: "GET",
  });
  return await response.json();
}

export async function getSession(sessionID) {
  const response = await fetch(`/api/session/${sessionID}`, {
    method: "GET",
  });
  return await response.json();
}

export async function getSessionSteps(sessionID) {
  const response = await fetch(`/api/sessionsteps/${sessionID}`, {
    method: "GET",    
  });
  return await response.json();
}

export async function interactSession(sessionID, params) {
  const response = await fetch(`/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session: sessionID, params: params }),
  });
  return await response.json();
}



// export async function interactSession(sessionID, params) {
//     console.log(params);
//     const response = await fetch(`/api/session`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ session: sessionID, params: params }),
//     });
//     return await response.json();
//   }
  
export async function updateSession(action, params) {  

  if (action === "UPDATE_SESSION_STEP") {
    const response = await fetch(`/api/sessionsteps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "ADD_SESSION_STEP") {
    const response = await fetch(`/api/sessionsteps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "REMOVE_SESSION_STEP") {
    const stepID = params._id
    const response = await fetch(`/api/step/${stepID}`, {
      method: "DELETE",
    });
    return await response.json();


    
  }
}

export async function interactStudentRun(action, params) {
  
  if (action === "INIT_STEP") {
    const response = await fetch(`/api/steprun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "INIT_USER_SESSION") {
    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if(action === "GET_USER_SESSION") {
    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "SET_STEP_STATUS") {
    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "SET_STEP_RATING") {
    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "SET_STEP_LOCK") {

    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "SET_STEP_DURATION") {
    const {stepid, duration } = params;
    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }

  if (action === "SET_STEP_GRADE") {
    const {stepid, grade } = params;
    const response = await fetch(`/api/learnersessionrun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {action, params}),
    });
    return await response.json();
  }
}

export async function createSession(data) {
  const response = await fetch(`/api/session/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session: data }),
  });
  return await response.json();
}

export async function deleteSession(sessionId) {
  const response = await fetch(`/api/session/${sessionId}`, {
    method: "DELETE",
  });
  return await response.json();
}

export async function editSession(data) {
  const response = await fetch(`/api/session`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session: data }),
  });
  return await response.json();
}

export async function fetchSettings() {
  const response = await fetch("/api/settings");
  return await response.json();
}
