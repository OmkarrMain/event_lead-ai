const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function getLeads(params = {}) {
  const query = new URLSearchParams();

  if (params.search) {
    query.append("search", params.search);
  }

  if (params.status) {
    query.append("status", params.status);
  }

  if (params.event) {
    query.append("event", params.event);
  }

  const queryString = query.toString();

  const response = await fetch(
    `${API_URL}/leads/${queryString ? `?${queryString}` : ""}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch leads");
  }

  return response.json();
}

export async function createLead(lead) {
  const response = await fetch(`${API_URL}/leads/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error("Failed to create lead");
  }

  return response.json();
}

export async function updateLead(id, lead) {
  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error("Failed to update lead");
  }

  return response.json();
}

export async function deleteLead(id) {
  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete lead");
  }

  return response.json();
}

export async function getLeadScore(id) {
  const response = await fetch(`${API_URL}/leads/${id}/score`);

  if (!response.ok) {
    throw new Error("Failed to calculate lead score");
  }

  return response.json();
}

export async function getLeadSummary(id) {
  const response = await fetch(`${API_URL}/leads/${id}/summary`);

  if (!response.ok) {
    throw new Error("Failed to generate lead summary");
  }

  return response.json();
}

export async function getFollowUpRecommendation(id) {
  const response = await fetch(`${API_URL}/leads/${id}/follow-up`);

  if (!response.ok) {
    throw new Error("Failed to get follow-up recommendation");
  }

  return response.json();
}

export async function getAnalytics() {
  const response = await fetch(`${API_URL}/analytics/`);

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}

export async function restoreBackup(backup) {
  const response = await fetch(`${API_URL}/leads/restore`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backup),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail || "Failed to restore backup");
  }

  return response.json();
}
