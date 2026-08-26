import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

// Formats a raw digit string into CNIC format: 00000-0000000-0
const formatCnic = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const SignInView = () => {
  const { login, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('public');

  // Public tab state — start EMPTY (no pre-filled CNIC)
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Enterprise tab state
  const [enterpriseEmail, setEnterpriseEmail] = useState('');

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  // ── Validation helpers ────────────────────────────────────────────────────
  const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isCnic  = (val) => CNIC_REGEX.test(val.trim());
  const isEmail = (val) => EMAIL_REGEX.test(val.trim());

  const validatePublicForm = () => {
    const newErrors = {};

    const id = identity.trim();
    if (!id) {
      newErrors.identity = 'CNIC Number or Email Address is required.';
    } else if (!isCnic(id) && !isEmail(id)) {
      newErrors.identity = isCnic(id)
        ? ''
        : id.includes('@')
          ? 'Email address format is invalid (e.g. name@domain.com).'
          : 'CNIC must be in format: 00000-0000000-0 (13 digits with hyphens).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    return newErrors;
  };

  const validateEnterpriseForm = () => {
    const newErrors = {};
    if (!enterpriseEmail.trim()) {
      newErrors.enterpriseEmail = 'Official Government / Partner email is required.';
    } else if (!isEmail(enterpriseEmail)) {
      newErrors.enterpriseEmail = 'Please enter a valid official email address.';
    }
    return newErrors;
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setGlobalError('');

    const fieldErrors = activeTab === 'public'
      ? validatePublicForm()
      : validateEnterpriseForm();

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    // Demo: login uses the role from context; in production this would call an API
    login();
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigateTo('2fa-verify');
  };

  const handleIdentityChange = (e) => {
    const raw = e.target.value;
    // If it looks like pure digits or a CNIC-in-progress, apply CNIC formatting
    const isNumerical = /^[\d-]*$/.test(raw);
    setIdentity(isNumerical ? formatCnic(raw) : raw);
    if (errors.identity) setErrors(prev => ({ ...prev, identity: '' }));
  };

  const FieldError = ({ msg }) =>
    msg ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontSize: '11.5px', color: '#dc2626' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
        <span>{msg}</span>
      </div>
    ) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', padding: '20px' }}>
      <div className="stitch-signin-card">
        {/* Lock Circle */}
        <div className="stitch-icon-circle">
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>lock</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            AIN LMS Portal
          </h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Artificial Intelligence Network — Secure Identity Gateway
          </p>
        </div>

        {globalError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            <span>{globalError}</span>
          </div>
        )}

        {/* Tab Group */}
        <div className="stitch-tab-group">
          <button
            type="button"
            className={`stitch-tab-btn ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => { setActiveTab('public'); setErrors({}); }}
          >
            Public / Trainee Sign In
          </button>
          <button
            type="button"
            className={`stitch-tab-btn ${activeTab === 'enterprise' ? 'active' : ''}`}
            onClick={() => { setActiveTab('enterprise'); setErrors({}); }}
          >
            Enterprise / Govt SSO
          </button>
        </div>

        {activeTab === 'public' ? (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
            {/* CNIC / Email field */}
            <div>
              <div className="relative-input-wrapper">
                <input
                  id="public-identifier"
                  type="text"
                  className={`floating-input${errors.identity ? ' input-error' : ''}`}
                  placeholder=" "
                  autoComplete="username"
                  value={identity}
                  onChange={handleIdentityChange}
                  onBlur={() => {
                    if (identity.trim()) {
                      const id = identity.trim();
                      if (!isCnic(id) && !isEmail(id)) {
                        const isPartialCnic = /^\d[\d-]*$/.test(id);
                        setErrors(prev => ({
                          ...prev,
                          identity: isPartialCnic
                            ? 'CNIC must be in format: 00000-0000000-0'
                            : 'Enter a valid CNIC (00000-0000000-0) or email address.'
                        }));
                      }
                    }
                  }}
                />
                <label className="floating-label" htmlFor="public-identifier">CNIC Number or Email Address</label>
              </div>
              <FieldError msg={errors.identity} />
              {!errors.identity && identity.trim() && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-subtle)' }}>
                  {isCnic(identity.trim())
                    ? '✓ Valid CNIC format'
                    : isEmail(identity.trim())
                      ? '✓ Valid email address'
                      : 'Format: 00000-0000000-0 or name@domain.com'}
                </div>
              )}
              {!identity.trim() && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-subtle)' }}>
                  Enter your 13-digit CNIC or email address
                </div>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="relative-input-wrapper" style={{ position: 'relative' }}>
                <input
                  id="public-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`floating-input${errors.password ? ' input-error' : ''}`}
                  style={{ paddingRight: '40px' }}
                  placeholder=" "
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                />
                <label className="floating-label" htmlFor="public-password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <FieldError msg={errors.password} />
              {!errors.password && password && password.length < 8 && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#f59e0b' }}>
                  {8 - password.length} more character{8 - password.length !== 1 ? 's' : ''} needed
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                Remember this device
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', padding: 0, fontSize: '12px' }}
              >
                Forgot Password / OTP Reset?
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
              Authorize &amp; Enter Portal
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
            <div>
              <div className="relative-input-wrapper">
                <input
                  id="enterprise-email"
                  type="email"
                  className={`floating-input${errors.enterpriseEmail ? ' input-error' : ''}`}
                  placeholder=" "
                  autoComplete="email"
                  value={enterpriseEmail}
                  onChange={(e) => {
                    setEnterpriseEmail(e.target.value);
                    if (errors.enterpriseEmail) setErrors(prev => ({ ...prev, enterpriseEmail: '' }));
                  }}
                />
                <label className="floating-label" htmlFor="enterprise-email">Official Govt / Partner Email</label>
              </div>
              <FieldError msg={errors.enterpriseEmail} />
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-subtle)' }}>
                e.g. name@ministry.gov.pk or name@university.edu.pk
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#1e40af', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginTop: '1px' }}>info</span>
              <span>You will be redirected to your institution's Single Sign-On (SSO) provider to complete authentication.</span>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
              Continue to SSO Provider
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </form>
        )}

        {/* Create Account & Portal Shortcuts */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Don't have an account yet?{' '}
            </span>
            <button
              type="button"
              onClick={() => navigateTo('sign-up')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Create Account
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={() => navigateTo('landing-page')}
              style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Back to Home
            </button>
            <button
              type="button"
              onClick={() => navigateTo('authenticator')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              🔍 Verify Trainee Credential
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
