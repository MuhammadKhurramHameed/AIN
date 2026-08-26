import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Send, 
  GraduationCap, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

// ── Validation helpers ────────────────────────────────────────────────────────
const CNIC_REGEX  = /^\d{5}-\d{7}-\d{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+92|03)\d{9,10}$/;
const URL_REGEX   = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;

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

export const TrainerRegistrationView = () => {
  const { registerTrainer, navigateTo, switchRole, tracks } = useApp();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cnic: '',
    phone: '',
    password: '',
    confirm_password: '',
    education: 'MS in Computer Science (AI Specialization) — 18 Years',
    institution: '',
    experience_years: 5,
    assigned_track: 'Track 1: Students & Fresh Graduates',
    specializations: [],
    portfolio_url: '',
    notes: ''
  });

  const [submittedRef, setSubmittedRef] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleCnicChange = (e) => {
    set('cnic', formatCnic(e.target.value));
  };

  const handleCheckboxChange = (spec) => {
    setFormData(prev => {
      const exists = prev.specializations.includes(spec);
      const updated = exists
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec];
      return { ...prev, specializations: updated };
    });
    if (errors.specializations) setErrors(prev => ({ ...prev, specializations: '' }));
  };

  const validate = () => {
    const e = {};

    if (!formData.full_name.trim() || formData.full_name.trim().length < 3)
      e.full_name = 'Full name must be at least 3 characters (as on CNIC).';

    if (!CNIC_REGEX.test(formData.cnic.trim()))
      e.cnic = 'CNIC must be in standard format: 00000-0000000-0';

    if (!EMAIL_REGEX.test(formData.email.trim()))
      e.email = 'Please enter a valid official email address (e.g. name@university.edu.pk).';

    const cleanPhone = formData.phone.replace(/\s+/g, '');
    if (!PHONE_REGEX.test(cleanPhone))
      e.phone = 'Enter a valid Pakistani phone number (e.g. +92 300 1234567 or 03001234567).';

    if (!formData.password)
      e.password = 'Password is required.';
    else if (formData.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(formData.password))
      e.password = 'Password must contain at least one uppercase letter.';
    else if (!/\d/.test(formData.password))
      e.password = 'Password must contain at least one number.';

    if (formData.confirm_password !== formData.password)
      e.confirm_password = 'Passwords do not match.';

    if (!formData.institution.trim() || formData.institution.trim().length < 3)
      e.institution = 'Please enter your affiliated university or organization.';

    if (Number(formData.experience_years) < 3)
      e.experience_years = 'AIN Accreditation requires a minimum of 3 years of AI / academic experience.';

    if (formData.specializations.length === 0)
      e.specializations = 'Please select at least one AI specialization area.';

    if (formData.portfolio_url.trim() && !URL_REGEX.test(formData.portfolio_url.trim()))
      e.portfolio_url = 'Please enter a valid URL (e.g. https://github.com/your-profile).';

    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      // Scroll to first error
      const firstErrorEl = document.querySelector('.trainer-reg-form .has-error');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    const { confirm_password, ...submittable } = formData;
    const created = registerTrainer(submittable);
    setSubmittedRef(created);
  };

  if (submittedRef) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        <div className="card" style={{ maxWidth: '640px', width: '100%', textAlign: 'center', padding: '40px 30px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Clock size={32} />
          </div>

          <div className="badge badge-warning" style={{ fontSize: '12px', padding: '6px 14px', marginBottom: '14px' }}>
            Application Status: PENDING SUPER ADMIN APPROVAL
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-headline)' }}>
            Trainer Application Registered!
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            Thank you, <strong>{submittedRef.full_name}</strong>. Your profile and credentials have been securely transmitted to the{' '}
            <strong>AIN Super Admin Governance Panel</strong> for verification against the National AI Accreditation criteria.
          </p>

          <div style={{ background: 'var(--surface-dim)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left', marginBottom: '28px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-subtle)' }}>Application Reference:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{submittedRef.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-subtle)' }}>Applicant CNIC:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{submittedRef.cnic}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-subtle)' }}>Education &amp; Experience:</span>
              <span>{submittedRef.education} ({submittedRef.experience_years} yrs exp)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-subtle)' }}>Assigned Track:</span>
              <span>{submittedRef.assigned_track}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => { switchRole('SUPER_ADMIN'); navigateTo('trainer-approval'); }}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', padding: '12px' }}
            >
              👑 Open Super Admin Panel to Approve this Trainer (Demo Quick Action)
            </button>

            <button 
              onClick={() => navigateTo('sign-in')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={14} /> Back to Sign In Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'var(--font-body)' }}>
      <div style={{ width: '100%', maxWidth: '780px' }}>
        
        {/* Top Header Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigateTo('sign-in')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
            AIN Accredited Instructor Application
          </span>
        </div>

        <div className="card" style={{ padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-tint)', border: '1px solid var(--primary-border)', padding: '4px 12px', borderRadius: '9999px', fontSize: '11.5px', color: 'var(--primary-dark)', fontWeight: 700, marginBottom: '8px' }}>
              <ShieldCheck size={13} /> Subject Matter Expert (SME) Registration
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-headline)', margin: '0 0 6px' }}>
              Apply as an Accredited AI Trainer
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
              AIN Accreditation requires ≥ 16 years of education and ≥ 3 years of industry experience. Applications are reviewed and activated by the Super Admin.
            </p>
          </div>

          {/* Global error summary if many errors */}
          {Object.keys(errors).length >= 3 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={16} />
              <span>Please fix <strong>{Object.keys(errors).length}</strong> validation errors before submitting.</span>
            </div>
          )}

          <form className="trainer-reg-form" onSubmit={handleSubmit} noValidate>
            {/* Step 1: Personal & Identity */}
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>
              Personal &amp; NADRA Identity Verification
            </div>

            <div className="grid-2">
              <div className={`form-group${errors.full_name ? ' has-error' : ''}`}>
                <label className="form-label">Full Name (as on CNIC) *</label>
                <input
                  type="text"
                  className={`form-control${errors.full_name ? ' input-error' : ''}`}
                  placeholder="e.g. Dr. Hammad Mustafa"
                  value={formData.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                />
                <FieldError msg={errors.full_name} />
              </div>

              <div className={`form-group${errors.cnic ? ' has-error' : ''}`}>
                <label className="form-label">CNIC Number (NADRA Verified) *</label>
                <input
                  type="text"
                  className={`form-control${errors.cnic ? ' input-error' : ''}`}
                  placeholder="35201-1234567-1"
                  value={formData.cnic}
                  onChange={handleCnicChange}
                />
                <FieldError msg={errors.cnic} />
                {!errors.cnic && formData.cnic && CNIC_REGEX.test(formData.cnic) && (
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={11} /> Valid CNIC format
                  </div>
                )}
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '20px' }}>
              <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  className={`form-control${errors.email ? ' input-error' : ''}`}
                  placeholder="hammad@university.edu.pk"
                  value={formData.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <FieldError msg={errors.email} />
              </div>

              <div className={`form-group${errors.phone ? ' has-error' : ''}`}>
                <label className="form-label">Contact Phone *</label>
                <input
                  type="tel"
                  className={`form-control${errors.phone ? ' input-error' : ''}`}
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                <FieldError msg={errors.phone} />
              </div>

              <div className={`form-group${errors.password ? ' has-error' : ''}`}>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className={`form-control${errors.password ? ' input-error' : ''}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={formData.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password"
                />
                <FieldError msg={errors.password} />
              </div>
            </div>

            {/* Confirm Password */}
            <div className={`form-group${errors.confirm_password ? ' has-error' : ''}`} style={{ marginBottom: '20px' }}>
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className={`form-control${errors.confirm_password ? ' input-error' : ''}`}
                placeholder="Re-enter your password"
                value={formData.confirm_password}
                onChange={(e) => set('confirm_password', e.target.value)}
                autoComplete="new-password"
              />
              <FieldError msg={errors.confirm_password} />
              {!errors.confirm_password && formData.confirm_password && formData.confirm_password === formData.password && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={11} /> Passwords match
                </div>
              )}
            </div>

            {/* Step 2: Academic & Industry Qualifications */}
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</span>
              Academic Credentials &amp; Industry Experience
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Highest Degree Qualification *</label>
                <select 
                  className="form-control"
                  value={formData.education}
                  onChange={(e) => set('education', e.target.value)}
                >
                  <option value="MS in Computer Science (AI Specialization) — 18 Years">MS / M.Phil in CS / AI (18 Years)</option>
                  <option value="PhD in Artificial Intelligence / Data Science — 20+ Years">PhD in AI / Machine Learning (20+ Years)</option>
                  <option value="BS in Computer Science / Software Engineering — 16 Years">BS in CS / SE / Data Science (16 Years)</option>
                  <option value="Master of Information Technology — 16 Years">MIT / MCS (16 Years)</option>
                </select>
              </div>

              <div className={`form-group${errors.institution ? ' has-error' : ''}`}>
                <label className="form-label">Affiliated University / Organization *</label>
                <input
                  type="text"
                  className={`form-control${errors.institution ? ' input-error' : ''}`}
                  placeholder="e.g. NUST / FAST / LUMS / Tech Enterprise"
                  value={formData.institution}
                  onChange={(e) => set('institution', e.target.value)}
                />
                <FieldError msg={errors.institution} />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <div className={`form-group${errors.experience_years ? ' has-error' : ''}`}>
                <label className="form-label">Total AI/Industry Experience (Years) *</label>
                <input
                  type="number"
                  min="3"
                  max="35"
                  className={`form-control${errors.experience_years ? ' input-error' : ''}`}
                  value={formData.experience_years}
                  onChange={(e) => set('experience_years', e.target.value)}
                />
                <FieldError msg={errors.experience_years} />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Curriculum Track *</label>
                <select 
                  className="form-control"
                  value={formData.assigned_track}
                  onChange={(e) => set('assigned_track', e.target.value)}
                >
                  {tracks.map(t => (
                    <option key={t.id} value={`Track ${t.number}: ${t.title}`}>
                      Track #{t.number}: {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialization Matrix */}
            <div className={`form-group${errors.specializations ? ' has-error' : ''}`} style={{ marginBottom: '20px' }}>
              <label className="form-label">
                Key AI Specializations &amp; Competencies *
                <span style={{ fontWeight: 400, color: 'var(--text-subtle)', marginLeft: '6px' }}>(select at least 1)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--surface-dim)', padding: '14px', borderRadius: 'var(--radius-md)', border: errors.specializations ? '1px solid #fca5a5' : 'none' }}>
                {[
                  'Machine Learning',
                  'Deep Learning',
                  'NLP & LLMs',
                  'Computer Vision',
                  'MLOps & Deployment',
                  'AI Ethics & Governance',
                  'Robotics & Edge AI',
                  'FinTech & Risk Scoring',
                  'Agentic Workflows'
                ].map(spec => {
                  const isChecked = formData.specializations.includes(spec);
                  return (
                    <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(spec)}
                      />
                      <span>{spec}</span>
                    </label>
                  );
                })}
              </div>
              <FieldError msg={errors.specializations} />
            </div>

            <div className={`form-group${errors.portfolio_url ? ' has-error' : ''}`} style={{ marginBottom: '20px' }}>
              <label className="form-label">GitHub / Portfolio / Research Profile URL</label>
              <input
                type="text"
                className={`form-control${errors.portfolio_url ? ' input-error' : ''}`}
                placeholder="https://github.com/your-profile or Google Scholar"
                value={formData.portfolio_url}
                onChange={(e) => set('portfolio_url', e.target.value)}
              />
              <FieldError msg={errors.portfolio_url} />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Brief Background Summary &amp; Industry Track Record</label>
              <textarea
                rows="3"
                className="form-control"
                placeholder="Describe your prior AI teaching experience, capstone mentorship, and hands-on tool proficiencies..."
                value={formData.notes}
                onChange={(e) => set('notes', e.target.value)}
              ></textarea>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12.5px', color: '#166534' }}>
              <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>AIN Gatekeeper Notice:</strong> Submitting this form registers your candidate profile with status <code>PENDING_APPROVAL</code>.{' '}
                The AIN Super Admin will review your credentials and grant accreditation before you can sign in to propose courses and instruct students.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigateTo('sign-in')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <Send size={15} /> Submit Application to Super Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
