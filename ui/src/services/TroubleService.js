export async function createTroubleRequest(params) {
    const action = "CREATE_TROUBLE";
    const response = await fetch(`/api/trouble`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, params }),
    });
    return await response.json();
  }
  export async function cancelTroubleRequest(params) {
    const action = "CANCEL_TROUBLE";
    const response = await fetch(`/api/trouble`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, params }),
    });
    return await response.json();
  }
  export async function checkTroubleRequest(params) {
    if(!params.troubleID || params.troubleID.length<1)
       return;
    const action = "CHECK_TROUBLE";
    
    const response = await fetch(`/api/trouble`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, params }),
    });
    return await response.json();
  }
  export async function answerTroubleRequest(params) {
    const action = "ANSWER_TROUBLE";
    const response = await fetch(`/api/trouble`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, params }),
    });
    return await response.json();
  }
  
  export async function getRunTroubleRequest(runID) {
    const response = await fetch(`/api/runtrouble/${runID}`, { 
      method: "GET",
    });
    return await response.json();
  }
  
  export async function getMyWaitingTroubleRequest(student, runID) {
    const params = { student: student, runID: runID };
    const action = "GET_WAITING_TROUBLE";
    const response = await fetch(`/api/trouble`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, params }),
    });
    return await response.json();
  }
  
  
  