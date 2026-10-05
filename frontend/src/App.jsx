import { useEffect, useState } from "react";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadScore,
  getLeadSummary,
  getFollowUpRecommendation,
  getAnalytics,
  restoreBackup,
} from "./services/api";

import {
  downloadBackup,
  selectBackupFile,
  getLastBackupTime,
  isAutomaticBackupEnabled,
  setAutomaticBackup,
} from "./services/backup";

import "./App.css";

function App() {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    event: "",
    notes: "",
    follow_up_status: "PENDING",
  });

  const [selectedLead, setSelectedLead] = useState(null);

  const [leadScore, setLeadScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const [leadSummary, setLeadSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [selectedFollowUpLead, setSelectedFollowUpLead] = useState(null);
  const [followUpRecommendation, setFollowUpRecommendation] = useState(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [automaticBackup, setAutomaticBackupState] = useState(
    isAutomaticBackupEnabled(),
  );
  const [lastBackup, setLastBackup] = useState(getLastBackupTime());
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    loadLeads();
    loadAnalytics();
  }, []);

  async function loadLeads(params = {}) {
    try {
      setLoading(true);

      const data = await getLeads({
        search: params.search ?? search,
        status: params.status ?? status,
        event: params.event ?? eventFilter,
      });

      setLeads(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      setAnalyticsLoading(true);

      const data = await getAnalytics();

      setAnalytics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function refreshData() {
    await Promise.all([loadLeads(), loadAnalytics()]);
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
  }

  function handleEventChange(event) {
    setEventFilter(event.target.value);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      name: "",
      company: "",
      email: "",
      event: "",
      notes: "",
      follow_up_status: "PENDING",
    });

    setEditingLead(null);
    setShowForm(false);
  }

  function openAddForm() {
    setEditingLead(null);

    setFormData({
      name: "",
      company: "",
      email: "",
      event: "",
      notes: "",
      follow_up_status: "PENDING",
    });

    setShowForm(true);
  }

  function openEditForm(lead) {
    setEditingLead(lead);

    setFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      event: lead.event,
      notes: lead.notes || "",
      follow_up_status: lead.follow_up_status,
    });

    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
      } else {
        await createLead(formData);
      }

      resetForm();

      await refreshData();
    } catch (error) {
      console.error(error);
      alert("Failed to save lead");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLead(id);

      if (selectedLead?.id === id) {
        setSelectedLead(null);
        setLeadScore(null);
        setLeadSummary(null);
      }

      if (selectedFollowUpLead?.id === id) {
        setSelectedFollowUpLead(null);
        setFollowUpRecommendation(null);
      }

      await refreshData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete lead");
    }
  }

  async function handleScore(lead) {
    setSelectedLead(lead);
    setLeadScore(null);
    setScoreLoading(true);

    try {
      const result = await getLeadScore(lead.id);

      setLeadScore(result);
    } catch (error) {
      console.error(error);
      alert("Failed to calculate lead score");
    } finally {
      setScoreLoading(false);
    }
  }

  async function handleSummary(lead) {
    setSelectedLead(lead);
    setLeadSummary(null);
    setSummaryLoading(true);

    try {
      const result = await getLeadSummary(lead.id);

      setLeadSummary(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleFollowUp(lead) {
    setSelectedFollowUpLead(lead);
    setFollowUpRecommendation(null);
    setFollowUpLoading(true);

    try {
      const result = await getFollowUpRecommendation(lead.id);

      setFollowUpRecommendation(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI follow-up message");
    } finally {
      setFollowUpLoading(false);
    }
  }

  function closeScorePanel() {
    setSelectedLead(null);
    setLeadScore(null);
  }

  function closeSummaryPanel() {
    setSelectedLead(null);
    setLeadSummary(null);
  }

  function closeFollowUpPanel() {
    setSelectedFollowUpLead(null);
    setFollowUpRecommendation(null);
  }

  async function applyFilters() {
    await loadLeads({
      search,
      status,
      event: eventFilter,
    });
  }

  async function clearFilters() {
    setSearch("");
    setStatus("");
    setEventFilter("");

    await loadLeads({
      search: "",
      status: "",
      event: "",
    });
  }

  async function handleBackup() {
    try {
      setBackupLoading(true);

      await downloadBackup();

      setLastBackup(getLastBackupTime());
      setShowBackupMenu(false);

      alert("Backup created successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to create backup.");
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleRestore() {
    try {
      const backup = await selectBackupFile();

      if (!backup) {
        return;
      }

      if (backup.app !== "EventLead AI") {
        throw new Error("Invalid EventLead AI backup file.");
      }

      if (!Array.isArray(backup.leads)) {
        throw new Error("Backup file does not contain valid lead data.");
      }

      const confirmed = window.confirm(
        `Restore ${backup.leads.length} leads from this backup?`,
      );

      if (!confirmed) {
        return;
      }

      setBackupLoading(true);

      const result = await restoreBackup(backup);

      alert(
        `Backup restored successfully.\n\nCreated: ${result.created}\nUpdated: ${result.updated}`,
      );

      setShowBackupMenu(false);

      await refreshData();
    } catch (error) {
      console.error(error);

      if (error.message !== "No backup file selected") {
        alert(error.message || "Failed to restore backup.");
      }
    } finally {
      setBackupLoading(false);
    }
  }

  function handleAutomaticBackupChange(event) {
    const enabled = event.target.checked;

    setAutomaticBackup(enabled);
    setAutomaticBackupState(enabled);
  }

  const uniqueEvents = [
    ...new Set(leads.map((lead) => lead.event).filter(Boolean)),
  ];

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>EventLead AI</h1>
          <p>AI-powered event lead management</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add Lead
        </button>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat-card">
            <span>Total Leads</span>
            <strong>{analyticsLoading ? "..." : analytics?.total || 0}</strong>
          </div>

          <div className="stat-card">
            <span>Pending</span>
            <strong>
              {analyticsLoading ? "..." : analytics?.pending || 0}
            </strong>
          </div>

          <div className="stat-card">
            <span>Follow Up</span>
            <strong>
              {analyticsLoading ? "..." : analytics?.follow_up || 0}
            </strong>
          </div>

          <div className="stat-card">
            <span>Converted</span>
            <strong>
              {analyticsLoading ? "..." : analytics?.converted || 0}
            </strong>
          </div>

          <div className="stat-card">
            <span>Conversion Rate</span>
            <strong>
              {analyticsLoading ? "..." : `${analytics?.conversion_rate || 0}%`}
            </strong>
          </div>
        </section>

        <section className="filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={handleSearchChange}
            />

            <select value={status} onChange={handleStatusChange}>
              <option value="">All Statuses</option>

              <option value="PENDING">Pending</option>

              <option value="CONTACTED">Contacted</option>

              <option value="FOLLOW_UP">Follow Up</option>

              <option value="CONVERTED">Converted</option>

              <option value="CLOSED">Closed</option>
            </select>

            <select value={eventFilter} onChange={handleEventChange}>
              <option value="">All Events</option>

              {uniqueEvents.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>

            <button className="secondary-button" onClick={applyFilters}>
              Search
            </button>

            <button className="secondary-button" onClick={clearFilters}>
              Clear
            </button>

            <div className="backup-wrapper">
              <button
                className="secondary-button backup-button"
                onClick={() => setShowBackupMenu(!showBackupMenu)}
              >
                Backup
              </button>

              {showBackupMenu && (
                <div className="backup-menu">
                  <div className="backup-menu-header">
                    <h3>Backup & Restore</h3>

                    <button
                      className="backup-close"
                      onClick={() => setShowBackupMenu(false)}
                    >
                      ×
                    </button>
                  </div>

                  <button
                    className="backup-option"
                    onClick={handleBackup}
                    disabled={backupLoading}
                  >
                    <strong>Backup on Local Device</strong>

                    <span>Download all lead data as a JSON backup file</span>
                  </button>

                  <button
                    className="backup-option"
                    onClick={handleRestore}
                    disabled={backupLoading}
                  >
                    <strong>Restore Backup</strong>

                    <span>Restore leads from a previous backup file</span>
                  </button>

                  <div className="backup-divider"></div>

                  <div className="automatic-backup">
                    <div>
                      <strong>Automatic Backup</strong>

                      <span>Create a local backup automatically</span>
                    </div>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={automaticBackup}
                        onChange={handleAutomaticBackupChange}
                      />

                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="last-backup">
                    <span>Last Backup</span>

                    <strong>
                      {lastBackup
                        ? new Date(lastBackup).toLocaleString()
                        : "No backup yet"}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {showForm && (
          <section className="form-panel">
            <div className="form-header">
              <div>
                <h2>{editingLead ? "Edit Lead" : "Add New Lead"}</h2>

                <p>
                  {editingLead
                    ? "Update lead information"
                    : "Enter the event lead details"}
                </p>
              </div>

              <button className="close-button" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Company</label>

                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Event</label>

                  <input
                    type="text"
                    name="event"
                    value={formData.event}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Follow-Up Status</label>

                  <select
                    name="follow_up_status"
                    value={formData.follow_up_status}
                    onChange={handleFormChange}
                  >
                    <option value="PENDING">Pending</option>

                    <option value="CONTACTED">Contacted</option>

                    <option value="FOLLOW_UP">Follow Up</option>

                    <option value="CONVERTED">Converted</option>

                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Interaction Notes</label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="4"
                    placeholder="Enter interaction notes..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingLead ? "Update Lead" : "Create Lead"}
                </button>
              </div>
            </form>
          </section>
        )}

        {selectedLead && leadScore && (
          <section className="score-panel">
            <div className="score-header">
              <div>
                <h3>AI Lead Score</h3>

                <p>
                  {selectedLead.name} · {selectedLead.company}
                </p>
              </div>

              <button className="close-button" onClick={closeScorePanel}>
                ×
              </button>
            </div>

            <div className="score-content">
              <div className="score-main">
                <span>Score</span>

                <strong>{leadScore.score}/100</strong>

                <span
                  className={`score-category ${String(
                    leadScore.category,
                  ).toLowerCase()}`}
                >
                  {leadScore.category}
                </span>
              </div>

              <div className="score-reasons">
                <h4>Reasons</h4>

                {leadScore.reasons?.map((reason, index) => (
                  <p key={index}>• {reason}</p>
                ))}
              </div>

              <div className="score-recommendation">
                <h4>Recommendation</h4>

                <p>{leadScore.recommendation}</p>
              </div>
            </div>
          </section>
        )}

        {selectedLead && scoreLoading && (
          <section className="score-panel">
            <div className="score-content">
              <p>Calculating AI lead score...</p>
            </div>
          </section>
        )}

        {selectedLead && leadSummary && (
          <section className="summary-panel">
            <div className="summary-header">
              <div>
                <h3>AI Lead Summary</h3>

                <p>
                  {selectedLead.name} · {selectedLead.company}
                </p>
              </div>

              <button className="close-button" onClick={closeSummaryPanel}>
                ×
              </button>
            </div>

            <div className="summary-content">
              <p>{leadSummary.summary}</p>
            </div>
          </section>
        )}

        {selectedLead && summaryLoading && (
          <section className="summary-panel">
            <div className="summary-content">
              <p>Generating AI summary...</p>
            </div>
          </section>
        )}

        {selectedFollowUpLead && (
          <section className="follow-up-panel">
            <div className="follow-up-header">
              <div>
                <h3>AI Follow-Up Message</h3>

                <p>
                  {selectedFollowUpLead.name} · {selectedFollowUpLead.company}
                </p>
              </div>

              <button className="close-button" onClick={closeFollowUpPanel}>
                ×
              </button>
            </div>

            <div className="follow-up-content">
              {followUpLoading ? (
                <p>Generating personalized follow-up message...</p>
              ) : followUpRecommendation?.message ? (
                <div className="message-box">
                  <p>{followUpRecommendation.message}</p>
                </div>
              ) : (
                <p>No follow-up message generated.</p>
              )}
            </div>
          </section>
        )}

        <section className="leads-section">
          <div className="section-header">
            <div>
              <h2>Event Leads</h2>

              <p>Manage and analyze your event leads</p>
            </div>

            <span className="lead-count">{leads.length} leads</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <h3>No leads found</h3>

              <p>Add a lead or change your search filters.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={lead.id}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>{lead.name}</strong>
                      </td>

                      <td>{lead.company}</td>

                      <td>{lead.email}</td>

                      <td>{lead.event}</td>

                      <td>
                        <span
                          className={`status status-${String(
                            lead.follow_up_status,
                          ).toLowerCase()}`}
                        >
                          {lead.follow_up_status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button score-button"
                            onClick={() => handleScore(lead)}
                          >
                            AI Score
                          </button>

                          <button
                            className="action-button summary-button"
                            onClick={() => handleSummary(lead)}
                          >
                            AI Summary
                          </button>

                          <button
                            className="action-button follow-up-button"
                            onClick={() => handleFollowUp(lead)}
                          >
                            Follow-Up
                          </button>

                          <button
                            className="action-button edit-button"
                            onClick={() => openEditForm(lead)}
                          >
                            Edit
                          </button>

                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(lead.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
