import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const TwoFactorVerifyView = () => {
  const { roleConfig, currentRole, login } = useApp();
  const [digits, setDigits] = useState(['4', '8', '9', '2', '5', '4']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    login(currentRole);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh", padding: "20px" }}>
      <div className="stitch-signin-card" style={{ maxWidth: "440px" }}>
        <div className="stitch-icon-circle">
          <span className="material-symbols-outlined" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
            Two-Factor Identity Verification
          </h1>
          <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", marginTop: "4px", lineHeight: 1.5 }}>
            Enter the 6-digit security OTP sent to your registered mobile number (***-***-**19) and email.
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="stitch-otp-group">
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
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
              Resend code in 00:42
            </p>
            <button type="button" style={{ background: "none", border: "none", color: "#1d4ed8", fontSize: "12px", cursor: "pointer", textDecoration: "underline", marginTop: "4px" }}>
              Change Phone/Email
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
            Verify &amp; Continue
          </button>
        </form>

      </div>
    </div>
  );
};
