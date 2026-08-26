import React, { useState } from 'react';
import { Users, Search, ShieldCheck, UserCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const UserManagementView = () => {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null); // inline success instead of alert()
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const [users, setUsers] = useState([
    { id: 'u1', name: 'Dr. Kamran Siddiqui', email: 'director@ain.gov.pk', cnic: '35201-9988776-1', role: 'SUPER_ADMIN', province: 'ICT', status: 'ACTIVE' },
    { id: 'u2', name: 'Engr. Ayesha Malik', email: 'ayesha.malik@ain.gov.pk', cnic: '37405-1122334-2', role: 'MOITT_AUDITOR', province: 'Punjab', status: 'ACTIVE' },
    { id: 'u3', name: 'Prof. Tariq Hassan', email: 'dean.computing@nust.edu.pk', cnic: '61101-4455667-3', role: 'CONSORTIUM_ADMIN', province: 'ICT', status: 'ACTIVE' },
    { id: 'u4', name: 'Dr. Zeeshan Haider', email: 'zeeshan.haider@nust.edu.pk', cnic: '35202-3344556-4', role: 'TRAINER', province: 'Punjab', status: 'ACTIVE' },
    { id: 'u5', name: 'Dr. Saima Riaz', email: 'reviewer.curriculum@ain.gov.pk', cnic: '42101-5566778-5', role: 'CONTENT_REVIEWER', province: 'Sindh', status: 'ACTIVE' },
    { id: 'u6', name: 'Fatima Khan', email: 'fatima.khan@gmail.com', cnic: '35201-1122334-6', role: 'TRAINEE', province: 'Punjab', status: 'ACTIVE' }
  ]);

  const filteredUsers = users.filter(u => {
    const matchesRole   = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase())
      || u.cnic.includes(search);
    return matchesRole && matchesSearch;
  });

  const ROLE_LABELS = {
    SUPER_ADMIN:      'Super Admin',
    MOITT_AUDITOR:    'AIN Auditor',
    CONSORTIUM_ADMIN: 'Consortium Admin',
    TRAINER:          'Trainer',
    CONTENT_REVIEWER: 'Content Reviewer',
    TRAINEE:          'Trainee',
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Guard: confirm before suspending
    if (selectedUser.status === 'SUSPENDED' && !confirmSuspend) {
      setConfirmSuspend(true);
      return;
    }

    setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
    await apiService.updateUser(selectedUser.id, { role: selectedUser.role, status: selectedUser.status });

    setSaveSuccess({ name: selectedUser.name, role: selectedUser.role, status: selectedUser.status });
    setSelectedUser(null);
    setConfirmSuspend(false);

    // Auto-dismiss success banner after 4 s
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="page-view">
      {/* Inline success banner */}
      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>
            <strong>{saveSuccess.name}</strong> updated — Role: <strong>{ROLE_LABELS[saveSuccess.role] || saveSuccess.role}</strong>, Status: <strong>{saveSuccess.status}</strong>
          </span>
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }} onClick={() => setSaveSuccess(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National Identity &amp; RBAC User Directory</h3>
            <p className="card-subtitle">Unified user directory across Super Admins, AIN Auditors, Consortium Admins, Trainers, and Trainees</p>
          </div>
          <span className="badge badge-primary">{filteredUsers.length} Users Displayed</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name, Email, or CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control form-select"
            style={{ width: '220px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="MOITT_AUDITOR">AIN Auditor</option>
            <option value="CONSORTIUM_ADMIN">Consortium Admin</option>
            <option value="TRAINER">Trainer</option>
            <option value="CONTENT_REVIEWER">Content Reviewer</option>
            <option value="TRAINEE">Trainee</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Official Email</th>
                <th>CNIC Number</th>
                <th>System Role</th>
                <th>Province</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>{u.cnic}</td>
                  <td><span className="badge badge-primary">{ROLE_LABELS[u.role] || u.role}</span></td>
                  <td>{u.province}</td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedUser(u); setConfirmSuspend(false); }}>
                      Edit Role / Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="modal-backdrop" style={{ backdropFilter: 'blur(6px)' }}>
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h4 className="card-title">Edit User Role &amp; Permissions</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedUser(null); setConfirmSuspend(false); }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateRoleSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
                  {selectedUser.name} ({selectedUser.email})
                </p>
                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    className="form-control form-select"
                    value={selectedUser.role}
                    onChange={(e) => { setSelectedUser({ ...selectedUser, role: e.target.value }); setConfirmSuspend(false); }}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="MOITT_AUDITOR">AIN Auditor</option>
                    <option value="CONSORTIUM_ADMIN">Consortium Admin</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="CONTENT_REVIEWER">Content Reviewer</option>
                    <option value="TRAINEE">Trainee</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Status *</label>
                  <select
                    className="form-control form-select"
                    value={selectedUser.status}
                    onChange={(e) => { setSelectedUser({ ...selectedUser, status: e.target.value }); setConfirmSuspend(false); }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                {/* Suspension confirmation warning */}
                {confirmSuspend && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', fontSize: '12.5px', color: '#991b1b', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <strong>Confirm Suspension?</strong><br />
                      Suspending <strong>{selectedUser.name}</strong> will revoke portal access immediately. Click "Confirm &amp; Save" to proceed.
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectedUser(null); setConfirmSuspend(false); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {confirmSuspend ? 'Confirm & Save' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
