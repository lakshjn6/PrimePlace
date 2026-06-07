import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

// Field component
function Field({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>

      <input
        style={{
          ...s.input,
          ...(error ? s.inputErr : {}),
        }}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />

      {error && (
        <p style={s.errMsg}>
          {Array.isArray(error) ? error.join(' ') : error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  // optional if you use auth context
  useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    password2: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    try {
      await authAPI.register(form);

      toast.success(
        '✅ Verification email sent! Please check your inbox.',
        {
          duration: 5000,
        }
      );

      // reset form
      setForm({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password2: '',
      });

      // redirect if needed
      navigate('/login');

    } catch (err) {
      setErrors(
        err.response?.data || {
          non_field_errors: ['Registration failed.'],
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <span style={s.logo}>◈ SubFlow</span>

          <h1 style={s.title}>Create your account</h1>

          <p style={s.sub}>
            Join thousands of subscribers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.row}>
            <Field
              name="first_name"
              label="First Name"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange}
              error={errors.first_name}
            />

            <Field
              name="last_name"
              label="Last Name"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange}
              error={errors.last_name}
            />
          </div>

          <div style={s.row}>
            <Field
              name="username"
              label="Username"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
            />

            <Field
              name="phone_number"
              label="Phone Number"
              placeholder="+91 9876543210"
              value={form.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
            />
          </div>

          <Field
            name="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Field
            name="password"
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Field
            name="password2"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={form.password2}
            onChange={handleChange}
            error={errors.password2}
          />

          {/* Backend Errors */}
          {errors.non_field_errors && (
            <div style={s.alertErr}>
              {Array.isArray(errors.non_field_errors)
                ? errors.non_field_errors.join(' ')
                : errors.non_field_errors}
            </div>
          )}

          {/* Button */}
          <button
            style={s.btn}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p style={s.footer}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// styles
const s = {
  page: {
    minHeight: '100vh',
    background: '#060608',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 520,
    background: '#0e0e12',
    border: '1px solid #1e1e2e',
    borderRadius: 24,
    padding: 40,
  },

  header: {
    textAlign: 'center',
    marginBottom: 32,
  },

  logo: {
    color: '#7c5cfc',
    fontWeight: 800,
    fontSize: 20,
    fontFamily: 'Georgia, serif',
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
    margin: '12px 0 6px',
    fontFamily: 'Georgia, serif',
  },

  sub: {
    color: '#555',
    fontSize: 14,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  label: {
    color: '#888',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.5,
  },

  input: {
    background: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
  },

  inputErr: {
    borderColor: '#ff4d4d',
  },

  errMsg: {
    color: '#ff4d4d',
    fontSize: 12,
    margin: 0,
  },

  alertErr: {
    background: 'rgba(255,77,77,0.1)',
    border: '1px solid rgba(255,77,77,0.3)',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#ff4d4d',
    fontSize: 13,
  },

  btn: {
    background: '#7c5cfc',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '14px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
  },

  footer: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    marginTop: 24,
  },

  link: {
    color: '#7c5cfc',
    textDecoration: 'none',
    fontWeight: 600,
  },
};