export async function getAllRuns() {
    const response = await fetch("/api/running");
    return await response.json();
  }

  export async function getLastActiveCourseRun(courseid) {
    const response = await fetch(`/api/courserun/${courseid}`, {
      method: "GET",    
    });
    return await response.json();
  }
  export async function getRun(runID) {
    const response = await fetch(`/api/run/${runID}`, {
      method: "GET",    
    });
    return await response.json();
  }

 
  export async function interactRun(action, id, status) {
    const response = await fetch(`/api/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({action: action, id: id, status:status }),
    });
    return await response.json();
  }

  export async function computeRunGrades(runid) {
    const action = "COMPUTE_ALL_GRADES"
    const response = await fetch(`/api/rungrades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({action: action, runid: runid }),
    });
    return await response.json();
  }

  export async function getRunGrades(runid) {
    const action = "GET_ALL_GRADES"
    const response = await fetch(`/api/rungrades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({action: action, runid: runid }),
    });
    return await response.json();
  }
