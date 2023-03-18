export async function createHelpRequest(params) {
  const action = "CREATE_HELP_REQUEST";
  const response = await fetch(`/api/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function cancelHelpRequest(params) {
  const action = "CANCEL_HELP_REQUEST";
  const response = await fetch(`/api/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function rateHelpRequest(params) {
  const action = "RATE_HELP_REQUEST";
  const response = await fetch(`/api/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function checkHelpRequest(params) {
  if(!params.helpID || params.helpID.length<1)
     return;
  const action = "CHECK_HELP_REQUEST";
  
  const response = await fetch(`/api/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function answerHelpRequest(params) {
  const action = "ANSWER_HELP_REQUEST";
  const response = await fetch(`/api/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}

export async function getRunHelpRequest(runID) {
  const response = await fetch(`/api/runhelp/${runID}`, { 
    method: "GET",
  });
  return await response.json();
}

export async function getRunUnlockRequest(runID) {
  const response = await fetch(`/api/rununlock/${runID}`, {
    method: "GET",
  });
  return await response.json();
}

export async function getMyWaitingHelpRequest(student, runID) {
  const params = { student: student, runID: runID };
  const action = "GET_MY_WAITING_HELP_REQUEST";
  const response = await fetch(`/api/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}

export async function getMyWaitingUnlockRequest(student, runID) {
  const params = { student: student, runID: runID };
  const action = "GET_MY_WAITING_UNLOCK_REQUEST";
  const response = await fetch(`/api/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}



export async function createUnlockRequest(params) {
  const action = "CREATE_UNLOCK_REQUEST";
  const response = await fetch(`/api/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function cancelUnlockRequest(params) {
  const action = "CANCEL_UNLOCK_REQUEST";
  const response = await fetch(`/api/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function checkUnlockRequest(params) {
  const action = "CHECK_UNLOCK_REQUEST";
  const response = await fetch(`/api/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}
export async function answerUnlockRequest(params) {
  const action = "ANSWER_UNLOCK_REQUEST";
  const response = await fetch(`/api/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return await response.json();
}

// export async function getRunUnlockRequest(params) {
//     const action = 'GET_RUN_UNLOCK_REQUESTS'
//     //console.log('unlock request:', params)
//     const response = await fetch(`/api/unlock`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ action, params }),
//     });
//     return await response.json();
//   }

export async function getLearnersSteps(runID) {
  const action = "GET_LEARNERS_STEPS";
  const response = await fetch(`/api/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, runID }),
  });
  return await response.json();
}
