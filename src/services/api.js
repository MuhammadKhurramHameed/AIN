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

  // Public Intake Registration
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

  // Audit Logs
  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/audit`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getAuditLogs error:', err.message);
      return null;
    }
  }
};
