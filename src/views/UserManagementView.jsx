import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, Filter, ShieldCheck, UserCheck } from 'lucide-react';

export const UserManagementView = () => {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [users] = useState([
    { id: "u1", name: "Dr. Kamran Siddiqui", email: "director.naiai@moitt.gov.pk", cnic: "35201-9988776-1", role: "SUPER_ADMIN", province: "ICT", status: "ACTIVE" },
    { id: "u2", name: "Engr. Ayesha Malik", email: "auditor.ai@moitt.gov.pk", cnic: "37405-1122334-2", role: "MOITT_AUDITOR", province: "Punjab", status: "ACTIVE" },
    { id: "u3", name: "Prof. Tariq Hassan", email: "dean.computing@nust.edu.pk", cnic: "61101-4455667-3", role: "CONSORTIUM_ADMIN", province: "ICT", status: "ACTIVE" },
    { id: "u4", name: "Dr. Zeeshan Haider", email: "zeeshan.haider@nust.edu.pk", cnic: "35202-3344556-4", role: "TRAINER", province: "Punjab", status: "ACTIVE" },
    { id: "u5", name: "Dr. Saima Riaz", email: "reviewer.curriculum@moitt.gov.pk", cnic: "42101-5566778-5", role: "CONTENT_REVIEWER", province: "Sindh", status: "ACTIVE" },
    { id: "u6", name: "Fatima Khan", email: "fatima.khan@gmail.com", cnic: "35201-1122334-6", role: "TRAINEE", province: "Punjab", status: "ACTIVE" },
    { id: "u7", name: "Usman Tariq", email: "usman.tariq@gmail.com", cnic: "37405-9988776-7", role: "TRAINEE", province: "Punjab", status: "ACTIVE" }
  ]);

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.cnic.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National Identity & RBAC User Directory</h3>
            <p className="card-subtitle">Unified user directory across Super Admins, Auditors, Consortium Admins, Trainers, and Trainees</p>
          </div>
          <span className="badge badge-primary">{filteredUsers.length} Users Displayed</span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, position: "relative" }}>
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
            style={{ width: "220px" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="MOITT_AUDITOR">MoITT Auditor</option>
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
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{u.cnic}</td>
                  <td><span className="badge badge-primary">{u.role}</span></td>
                  <td>{u.province}</td>
                  <td><span className="badge badge-success">{u.status}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Managing permissions for user: ${u.name}`)}>
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
