const API_BASE_URL = 'http://localhost:5000/api/v1';

export const apiService = {
  // Health check
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] Backend health check failed:', err.message);
      return null;
    }
  },

  // Authentication & Sign Up
  async signup(accountData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] signup error:', err.message);
      return null;
    }
  },

  async login(credentials) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] login error:', err.message);
      return null;
    }
  },

  // Programme Summary KPIs
  async getProgrammeSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/programme/summary`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getProgrammeSummary error:', err.message);
      return null;
    }
  },

  // Public Trainee Registration
  async registerTrainee(formData) {
    try {
      const res = await fetch(`${API_BASE_URL}/intake/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] registerTrainee error:', err.message);
      return null;
    }
  },

  // Bulk Trainee Registration
  async bulkRegisterTrainees(trainees, consortiumPartner) {
    try {
      const res = await fetch(`${API_BASE_URL}/intake/bulk-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainees, consortiumPartner })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] bulkRegisterTrainees error:', err.message);
      return null;
    }
  },

  // Trainers Management
  async getTrainers() {
    try {
      const res = await fetch(`${API_BASE_URL}/trainers`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getTrainers error:', err.message);
      return null;
    }
  },

  async addTrainer(trainerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainerData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] addTrainer error:', err.message);
      return null;
    }
  },

  // Cohorts Management
  async getCohorts() {
    try {
      const res = await fetch(`${API_BASE_URL}/cohorts`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getCohorts error:', err.message);
      return null;
    }
  },

  async addCohort(cohortData) {
    try {
      const res = await fetch(`${API_BASE_URL}/cohorts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cohortData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] addCohort error:', err.message);
      return null;
    }
  },

  // Telemetry & Live Chat
  async getChatMessages() {
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/chat`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getChatMessages error:', err.message);
      return null;
    }
  },

  async sendChatMessage(msgData) {
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] sendChatMessage error:', err.message);
      return null;
    }
  },

  async forceTelemetryPing(actor) {
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/force-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] forceTelemetryPing error:', err.message);
      return null;
    }
  },

  // Assessment Submission
  async submitAssessment(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] submitAssessment error:', err.message);
      return null;
    }
  },

  // Security Key Rotation
  async rotateEd25519Key() {
    try {
      const res = await fetch(`${API_BASE_URL}/security/rotate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] rotateEd25519Key error:', err.message);
      return null;
    }
  },

  // Users Management
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getUsers error:', err.message);
      return null;
    }
  },

  async updateUser(userId, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] updateUser error:', err.message);
      return null;
    }
  },

  // Certificate Verification
  async verifyCertificate(query) {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/verify/${query}`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] verifyCertificate error:', err.message);
      return null;
    }
  },

  // Consortium Partners
  async getPartners() {
    try {
      const res = await fetch(`${API_BASE_URL}/partners`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getPartners error:', err.message);
      return null;
    }
  },

  async addPartner(partnerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] addPartner error:', err.message);
      return null;
    }
  },

  // Tracks
  async getTracks() {
    try {
      const res = await fetch(`${API_BASE_URL}/tracks`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getTracks error:', err.message);
      return null;
    }
  },

  // Question Bank
  async getQuestions() {
    try {
      const res = await fetch(`${API_BASE_URL}/questions`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getQuestions error:', err.message);
      return null;
    }
  },

  async addQuestion(questionData) {
    try {
      const res = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] addQuestion error:', err.message);
      return null;
    }
  },

  // Audit Logs
  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/audit`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getAuditLogs error:', err.message);
      return null;
    }
  },

  // Report Schedules & Automated Email Dispatch
  async getReportSchedules() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/schedules`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getReportSchedules error:', err.message);
      return null;
    }
  },

  async saveReportSchedule(scheduleData) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] saveReportSchedule error:', err.message);
      return null;
    }
  },

  async deleteReportSchedule(scheduleId) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/schedules/${scheduleId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] deleteReportSchedule error:', err.message);
      return null;
    }
  },

  async sendReportEmail(emailPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] sendReportEmail error:', err.message);
      return null;
    }
  },

  // SMTP Settings
  async getSmtpConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/smtp-config`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getSmtpConfig error:', err.message);
      return null;
    }
  },

  async saveSmtpConfig(configData) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/smtp-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] saveSmtpConfig error:', err.message);
      return null;
    }
  }
};

