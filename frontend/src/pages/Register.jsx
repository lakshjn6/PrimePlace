import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

function Field({ name, label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className="pm-field">
      <label className="pm-label">{label}</label>
      <input
        className={`pm-input${error ? ' pm-input-err' : ''}`}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {error && (
        <p className="pm-err-msg">
          {Array.isArray(error) ? error.join(' ') : error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  useAuth();

  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', phone_number: '', password: '', password2: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('✅ Verification email sent! Please check your inbox.', { duration: 5000 });
      setForm({ first_name:'', last_name:'', username:'', email:'', phone_number:'', password:'', password2:'' });
      navigate('/login');
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Registration failed.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Mobile-safe styles ── */}
      <style>{`
        .pm-reg-page {
          min-height: 100vh;
          background: #060608;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          box-sizing: border-box;
        }
        .pm-reg-card {
          width: 100%;
          max-width: 520px;
          background: #0e0e12;
          border: 1px solid #1e1e2e;
          border-radius: 24px;
          padding: 40px;
          box-sizing: border-box;
        }
        .pm-reg-header { text-align: center; margin-bottom: 32px; }
        .pm-reg-logo   { color: #7c5cfc; font-weight: 800; font-size: 20px; font-family: Georgia,serif; }
        .pm-reg-title  { color: #fff; font-size: 28px; font-weight: 800; margin: 12px 0 6px; font-family: Georgia,serif; }
        .pm-reg-sub    { color: #555; font-size: 14px; margin: 0; }
        .pm-reg-form   { display: flex; flex-direction: column; gap: 16px; }

        /* Two-column row — collapses to 1 col on mobile */
        .pm-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pm-field  { display: flex; flex-direction: column; gap: 6px; }
        .pm-label  { color: #888; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
        .pm-input  {
          background: #111; border: 1px solid #2a2a2a; border-radius: 10px;
          padding: 12px 14px; color: #fff; font-size: 14px; outline: none;
          width: 100%; box-sizing: border-box;
        }
        .pm-input-err  { border-color: #ff4d4d !important; }
        .pm-err-msg    { color: #ff4d4d; font-size: 12px; margin: 0; }
        .pm-alert-err  {
          background: rgba(255,77,77,0.1); border: 1px solid rgba(255,77,77,0.3);
          border-radius: 8px; padding: 12px 16px; color: #ff4d4d; font-size: 13px;
        }
        .pm-reg-btn {
          background: #7c5cfc; color: #fff; border: none; border-radius: 10px;
          padding: 14px; font-size: 16px; font-weight: 700; cursor: pointer;
          margin-top: 8px; width: 100%;
        }
        .pm-reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pm-reg-footer { text-align: center; color: #555; font-size: 14px; margin-top: 24px; }
        .pm-reg-link   { color: #7c5cfc; text-decoration: none; font-weight: 600; }

        /* ── Mobile breakpoint ── */
        @media (max-width: 480px) {
          .pm-reg-card  { padding: 24px 16px; border-radius: 16px; }
          .pm-reg-title { font-size: 22px; }
          .pm-row       { grid-template-columns: 1fr; }  /* stack to single col */
        }
      `}</style>

      <div className="pm-reg-page">
        <div className="pm-reg-card">

          <div className="pm-reg-header">
            <span className="pm-reg-logo">◈ PrimeMarket</span>
            <h1 className="pm-reg-title">Create your account</h1>
            <p className="pm-reg-sub">Join thousands of subscribers</p>
          </div>

          <form onSubmit={handleSubmit} className="pm-reg-form">

            {/* Row 1 — First / Last name */}
            <div className="pm-row">
              <Field name="first_name" label="First Name" placeholder="John"
                value={form.first_name} onChange={handleChange} error={errors.first_name} />
              <Field name="last_name"  label="Last Name"  placeholder="Doe"
                value={form.last_name}  onChange={handleChange} error={errors.last_name} />
            </div>

            {/* Row 2 — Username / Phone */}
            <div className="pm-row">
              <Field name="username"     label="Username"     placeholder="johndoe"
                value={form.username}     onChange={handleChange} error={errors.username} />
              <Field name="phone_number" label="Phone Number" placeholder="+91 9876543210"
                value={form.phone_number} onChange={handleChange} error={errors.phone_number} />
            </div>

            <Field name="email"     label="Email Address"   type="email"
              placeholder="john@example.com"  value={form.email}
              onChange={handleChange} error={errors.email} />

            <Field name="password"  label="Password"        type="password"
              placeholder="Min. 6 characters" value={form.password}
              onChange={handleChange} error={errors.password} />

            <Field name="password2" label="Confirm Password" type="password"
              placeholder="Re-enter password" value={form.password2}
              onChange={handleChange} error={errors.password2} />

            {errors.non_field_errors && (
              <div className="pm-alert-err">
                {Array.isArray(errors.non_field_errors)
                  ? errors.non_field_errors.join(' ')
                  : errors.non_field_errors}
              </div>
            )}

            <button className="pm-reg-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="pm-reg-footer">
            Already have an account?{' '}
            <Link to="/login" className="pm-reg-link">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}