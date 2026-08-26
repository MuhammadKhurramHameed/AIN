import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff,
  GraduationCap, ArrowRight, Shield
} from 'lucide-react';
import { apiService } from '../services/api';

export const SignUpView = () => {
  const { navigateTo, login, registerTrainee } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    gender: 'FEMALE',
    province: 'Punjab',
    district: 'Lahore',
    enrolledTrack: 'Track 1: Students & Fresh Graduates (Applied MLOps)',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-format Pakistani CNIC (00000-0000000-0)
  const handleCnicChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 13);
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    }
    setFormData({ ...formData, cnic: formatted });
    if (errors.cnic) setErrors({ ...errors, cnic: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email is required.';
    
    if (!formData.cnic || formData.cnic.length < 15) {
      errs.cnic = 'Valid 13-digit CNIC is required (00000-0000000-0).';
    }

    if (!formData.password || formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 1. Call Backend API
      const res = await apiService.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'TRAINEE',
        cnic: formData.cnic,
        gender: formData.gender,
        province: formData.province,
        district: formData.district,
        phone: formData.phone,
        enrolledTrack: formData.enrolledTrack
      });

      // 2. Synchronize with Frontend Context
      registerTrainee({
        fullName: formData.fullName,
        email: formData.email,
        cnic: formData.cnic,
        gender: formData.gender,
        province: formData.province,
        district: formData.district,
        enrolledTrack: formData.enrolledTrack,
        phone: formData.phone
      });

      setIsSuccess(true);
      setTimeout(() => {
        login('TRAINEE', {
          id: res?.user?.id || `user-${Date.now()}`,
          name: formData.fullName,
          email: formData.email,
          role: 'TRAINEE',
          cnic: formData.cnic
        });
      }, 1400);

    } catch (err) {
      console.error('[Sign Up Error]', err);
      setErrors({ general: 'Registration failed. Please check your network connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Background Decorative Rings */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(0,0,0,0) 70%)',
        top: '10%',
        left: '15%',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '640px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Card Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '24px 30px',
          color: '#ffffff',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#2563eb', padding: '9px', borderRadius: '10px', display: 'flex' }}>
                <GraduationCap size={24} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Student &amp; Trainee Registration
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  Create your free learner account for the National AI Capacity Initiative
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('sign-in')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px 30px' }}>
          
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Student Account Created Successfully!
              </h4>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '16px' }}>
                Welcome, {formData.fullName}. Routing to your trainee dashboard and AI workspace...
              </p>
              <div className="badge badge-success" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                Role: Trainee / Student
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {/* General Error Banner */}
              {errors.general && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={16} />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* 1. PERSONAL INFORMATION */}
              <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Full Legal Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. Fatima Khan"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    required
                  />
                  {errors.fullName && <span style={{ color: '#dc2626', fontSize: '11px' }}>{errors.fullName}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Email Address <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'input-error' : ''}`}
                    placeholder="e.g. fatima@domain.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                  />
                  {errors.email && <span style={{ color: '#dc2626', fontSize: '11px' }}>{errors.email}</span>}
                </div>
              </div>

              {/* 2. CNIC, GENDER & PHONE */}
              <div className="grid-3" style={{ gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    CNIC Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.cnic ? 'input-error' : ''}`}
                    placeholder="35201-1234567-1"
                    value={formData.cnic}
                    onChange={handleCnicChange}
                    maxLength={15}
                    required
                  />
                  {errors.cnic && <span style={{ color: '#dc2626', fontSize: '11px' }}>{errors.cnic}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Gender <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    className="form-control form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Other / Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* 3. PROVINCE & DISTRICT */}
              <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Province / Territory <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    className="form-control form-select"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad ICT">Islamabad ICT</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Jammu & Kashmir">Azad Jammu &amp; Kashmir</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    City / District
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lahore"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>

              {/* 4. TRACK SELECTION */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Target AI Curriculum Track <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="form-control form-select"
                  value={formData.enrolledTrack}
                  onChange={(e) => setFormData({ ...formData, enrolledTrack: e.target.value })}
                >
                  <option value="Track 1: Students & Fresh Graduates (Applied MLOps)">Track 1: Students &amp; Fresh Graduates (Applied MLOps)</option>
                  <option value="Track 2: Teaching Professionals (AI in Pedagogy)">Track 2: Teaching Professionals (AI in Pedagogy)</option>
                  <option value="Track 3: Sectoral Professionals (Healthcare & FinTech AI)">Track 3: Sectoral Professionals (Healthcare &amp; FinTech AI)</option>
                  <option value="Track 4: Mid to C-Level Executives (Governance & Strategy)">Track 4: Mid to C-Level Executives (Governance &amp; Strategy)</option>
                  <option value="Track 5: Govt Officials & Public Servants (e-Governance)">Track 5: Govt Officials &amp; Public Servants (e-Governance)</option>
                  <option value="Track 6: Secretarial & Administrative Staff (Office Automation)">Track 6: Secretarial &amp; Administrative Staff (Office Automation)</option>
                  <option value="Track 7: General Workforce & Job Seekers (AI Productivity)">Track 7: General Workforce &amp; Job Seekers (AI Productivity)</option>
                  <option value="Track 8: Startup Founders & Tech Entrepreneurs (AI Product Building)">Track 8: Startup Founders &amp; Tech Entrepreneurs (AI Product Building)</option>
                  <option value="Track 9: School Students (STEM & Early AI Foundations)">Track 9: School Students (STEM &amp; Early AI Foundations)</option>
                </select>
              </div>

              {/* 5. PASSWORDS */}
              <div className="grid-2" style={{ gap: '14px', marginBottom: '22px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${errors.password ? 'input-error' : ''}`}
                      style={{ paddingRight: '36px' }}
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span style={{ color: '#dc2626', fontSize: '11px' }}>{errors.password}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-control ${errors.confirmPassword ? 'input-error' : ''}`}
                      style={{ paddingRight: '36px' }}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span style={{ color: '#dc2626', fontSize: '11px' }}>{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
                style={{ width: '100%', justifyContent: 'center', gap: '8px', fontWeight: 800, padding: '12px' }}
              >
                <span>{isSubmitting ? 'Creating Student Account...' : 'Create Free Student Account'}</span>
                <ArrowRight size={18} />
              </button>

            </form>
          )}

          {/* Footer Navigation */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
            <span style={{ color: '#64748b' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigateTo('sign-in')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </span>

            <button
              type="button"
              onClick={() => navigateTo('landing-page')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Back to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
