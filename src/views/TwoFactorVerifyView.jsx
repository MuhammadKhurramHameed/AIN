import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const TwoFactorVerifyView = () => {
  const { currentRole, login, navigateTo } = useApp();
  const [digits, setDigits] = useState(['4', '8', '9', '2', '5', '4']);
  const [timerSeconds, setTimerSeconds] = useState(42);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState('+92 300 9876543');
  const [contactInfo, setContactInfo] = useState('***-***-**19');

  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for OTP resend
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setErrorMessage('');

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResend = () => {
    setDigits(['', '', '', '', '', '']);
    setTimerSeconds(60);
    setErrorMessage('');
    setSuccessMessage('A new 6-digit OTP security code has been dispatched to your phone and email.');
    setTimeout(() => inputRefs[0].current?.focus(), 100);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const otpCode = digits.join('');
    if (otpCode.length < 6 || digits.some(d => d === '')) {
      setErrorMessage('Please enter all 6 digits of the OTP verification code.');
      return;
    }

    setSuccessMessage('OTP Security Verification Passed!');
    setTimeout(() => {
      login(currentRole);
    }, 800);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!newContact.trim()) return;
    setContactInfo(newContact.trim());
    setShowContactModal(false);
    setSuccessMessage(`OTP destination updated to ${newContact.trim()}. New code dispatched.`);
    setTimerSeconds(60);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh", padding: "20px" }}>
      <div className="stitch-signin-card" style={{ maxWidth: "460px" }}>
        <div className="stitch-icon-circle">
          <span className="material-symbols-outlined" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
            Identity Verification &amp; Password Reset
          </h1>
          <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", marginTop: "4px", lineHeight: 1.5 }}>
            Enter the 6-digit security OTP sent to your registered contact ({contactInfo}).
          </p>
        </div>

        {errorMessage && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px" }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px" }}>
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="stitch-otp-group" style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="stitch-otp-input"
                style={{ width: "48px", height: "54px", fontSize: "20px", textAlign: "center", fontWeight: 700, borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {timerSeconds > 0 ? (
              <p style={{ fontSize: "12px", color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
                Resend code in 00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                style={{ background: "none", border: "none", color: "#1d4ed8", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              >
                🔄 Resend 6-Digit Code Now
              </button>
            )}

            <div style={{ marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                style={{ background: "none", border: "none", color: "var(--text-subtle)", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
              >
                Change Phone / Email Destination
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: "12px" }}>
            Verify OTP &amp; Continue
          </button>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => navigateTo("sign-in")}
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}
            >
              ← Back to Sign In Portal
            </button>
          </div>
        </form>

      </div>

      {/* Change Contact Modal */}
      {showContactModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h4 className="card-title">Update OTP Contact Destination</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <form onSubmit={handleContactSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Phone Number or Email Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+92 300 1234567 or email@example.com"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowContactModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send New Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
