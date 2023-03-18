export async function getAllLearners() {

    const response = await fetch('/api/learners');
    return await response.json();
}

export async function createLearner(data) {    
    const response = await fetch(`/api/learner/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learner: data})
    })
    return await response.json();
}

export async function loginLearner(data) {
    const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learner: data})
    })
    return await response.json();
}

export async function logout(data) {
    const response = await fetch(`/api/logout`, {
        method: 'delete',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learner: data})
    })
    return await response.json();
}

export async function leave(data) {
    
    const response = await fetch(`/api/logout`, {
        method: 'delete',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learner: data})
    })
    return await response.json();
}

export async function deleteLearner(learnerId) {
    const response = await fetch(`/api/learner/${learnerId}`, {method: 'DELETE'})
    return await response.json();
}

export async function editLearner(data) {
    const response = await fetch(`/api/learner`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({learner: data})
    })
    return await response.json();
}

export async function fetchSettings() {

    const response = await fetch('/api/settings');
    return await response.json();
}