import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, CheckCircle, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

// ── Validation helpers ────────────────────────────────────────────────────────
const CNIC_REGEX  = /^\d{5}-\d{7}-\d{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+92|03)\d{9,10}$/;

const formatCnic = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

const FieldError = ({ msg }) =>
  msg ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '11.5px', color: '#dc2626' }}>
      <AlertCircle size={13} />
      <span>{msg}</span>
    </div>
  ) : null;

export const PublicIntakeView = () => {
  const { programme, tracks, registerTrainee, navigateTo } = useApp();
  const [formData, setFormData] = useState({
    cnic: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'FEMALE',
    province: 'Islamabad Capital Territory',
    district: '',
    trackId: 'track-1',
    pwd: false
  });

  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null); // inline success instead of alert()

  const femalePct = ((programme.female_registered_count / programme.registered_count) * 100).toFixed(1);

  const set = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!CNIC_REGEX.test(formData.cnic.trim()))
      e.cnic = 'CNIC must follow the Pakistani format: 00000-0000000-0 (13 digits with hyphens).';

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3)
      e.fullName = 'Full name must be at least 3 characters long.';

    if (!EMAIL_REGEX.test(formData.email.trim()))
      e.email = 'Please enter a valid email address (e.g. name@example.com).';

    const cleanPhone = formData.phone.replace(/\s+/g, '');
    if (!PHONE_REGEX.test(cleanPhone))
      e.phone = 'Enter a valid Pakistani phone number (e.g. +92 300 1234567 or 03001234567).';

    if (!formData.district.trim() || formData.district.trim().length < 2)
      e.district = 'Please enter your district (at least 2 characters).';

    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    registerTrainee(formData);

    // Show inline success card instead of alert()
    const selectedTrack = tracks.find(t => t.id === formData.trackId);
    setSuccessData({
      name: formData.fullName,
      cnic: formData.cnic,
      gender: formData.gender,
      province: formData.province,
      track: selectedTrack ? `Track ${selectedTrack.number}: ${selectedTrack.title}` : formData.trackId,
      cohort: 'NUST-MLOps-Batch-05'
    });
  };

  // ── Success State ──────────────────────────────────────────────────────────
  if (successData) {
    return (
      <div className="page-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={32} />
          </div>
          <span className="badge badge-success" style={{ fontSize: '12px', padding: '6px 14px', marginBottom: '16px' }}>
            Registration Successful
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-headline)' }}>
            Application Submitted!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Welcome, <strong>{successData.name}</strong>. You have been enrolled into the AIN National AI Programme.
          </p>
          <div style={{ background: 'var(--surface-dim)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left', marginBottom: '24px', fontSize: '12.5px' }}>
            {[
              ['Trainee Name', successData.name],
              ['CNIC', successData.cnic],
              ['Gender', successData.gender],
              ['Province', successData.province],
              ['Enrolled Track', successData.track],
              ['Assigned Cohort', successData.cohort],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-subtle)' }}>{label}:</span>
                <strong style={{ fontFamily: label === 'CNIC' ? 'var(--font-mono)' : undefined }}>{value}</strong>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigateTo('trainee-dashboard')}>
            <UserCheck size={16} /> Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">National AI Trainee Intake Portal</h3>
                <p className="card-subtitle">National AI Capacity Building &amp; Cohort Intake Portal</p>
              </div>
              <span className="badge badge-primary">NAIAI-2026</span>
            </div>

            {Object.keys(errors).length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={15} />
                <span>Please correct <strong>{Object.keys(errors).length}</strong> error{Object.keys(errors).length !== 1 ? 's' : ''} before submitting.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid-2">
                <div className={`form-group${errors.cnic ? ' has-error' : ''}`}>
                  <label className="form-label">CNIC Number (National ID) *</label>
                  <input
                    type="text"
                    className={`form-control${errors.cnic ? ' input-error' : ''}`}
                    placeholder="35201-1234567-8"
                    value={formData.cnic}
                    onChange={(e) => set('cnic', formatCnic(e.target.value))}
                  />
                  <FieldError msg={errors.cnic} />
                  {!errors.cnic && formData.cnic && CNIC_REGEX.test(formData.cnic) && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} /> Valid CNIC format
                    </div>
                  )}
                </div>
                <div className={`form-group${errors.fullName ? ' has-error' : ''}`}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className={`form-control${errors.fullName ? ' input-error' : ''}`}
                    placeholder="e.g. Fatima Khan"
                    value={formData.fullName}
                    onChange={(e) => set('fullName', e.target.value)}
                  />
                  <FieldError msg={errors.fullName} />
                </div>
              </div>

              <div className="grid-2">
                <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className={`form-control${errors.email ? ' input-error' : ''}`}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                  <FieldError msg={errors.email} />
                </div>
                <div className={`form-group${errors.phone ? ' has-error' : ''}`}>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className={`form-control${errors.phone ? ' input-error' : ''}`}
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                  <FieldError msg={errors.phone} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-control form-select"
                    value={formData.gender}
                    onChange={(e) => set('gender', e.target.value)}
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-Binary</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Province *</label>
                  <select
                    className="form-control form-select"
                    value={formData.province}
                    onChange={(e) => set('province', e.target.value)}
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Jammu & Kashmir">Azad Jammu &amp; Kashmir</option>
                  </select>
                </div>
                <div className={`form-group${errors.district ? ' has-error' : ''}`}>
                  <label className="form-label">District *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lahore"
                    value={formData.district}
                    onChange={(e) => set('district', e.target.value)}
                  />
                  <FieldError msg={errors.district} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Educational Qualification</label>
                  <select
                    className="form-control form-select"
                    value={formData.education}
                    onChange={(e) => set('education', e.target.value)}
                  >
                    <option value="Bachelors (In Progress)">Bachelors (In Progress)</option>
                    <option value="Bachelors (Completed)">Bachelors (Completed)</option>
                    <option value="Masters / MS">Masters / MS</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                    <option value="Intermediate / HSSC">Intermediate / HSSC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Selected National Track *</label>
                  <select
                    className="form-control form-select"
                    value={formData.selectedTrack}
                    onChange={(e) => set('selectedTrack', e.target.value)}
                  >
                    {tracks.map(t => (
                      <option key={t.id} value={t.title}>
                        Track {t.number}: {t.title} ({t.hours}h)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPwd}
                    onChange={(e) => set('isPwd', e.target.checked)}
                  />
                  <span>Person with Disabilities (PWD) / Special Accessibility Accommodation</span>
                </label>
              </div>

              {formData.isPwd && (
                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label className="form-label">Accessibility Details</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Describe any accommodations needed"
                    value={formData.pwdDetails}
                    onChange={(e) => set('pwdDetails', e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="reset" className="btn btn-secondary" onClick={() => { setErrors({}); setFormData({ cnic: '', fullName: '', email: '', phone: '', gender: 'FEMALE', province: 'Islamabad Capital Territory', district: '', education: 'Bachelors (In Progress)', selectedTrack: '', isPwd: false, pwdDetails: '' }); }}>Clear</button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <UserCheck size={18} /> Submit Intake Application
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h4 className="card-title">Initiative Benefits &amp; Accreditation</h4>
              <span className="badge badge-success">Free Program</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0', fontSize: '12.5px', color: '#334155' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>100% Free Tuition:</strong> Funded under the National AI Capacity Building mandate.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Interactive Python AI Lab:</strong> Hands-on Jupyter &amp; Skulpt workspaces.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Ed25519 Verified Certificate:</strong> Digital QR verifiable credential upon completion.</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Intake Help &amp; Support</h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              Need assistance with your registration or CNIC verification? Contact the AIN Intake Desk:
            </p>
            <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
              📧 intake.help@ain.gov.pk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
