import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loadUser } = useAuth();
  const [form, setForm] = useState({
    first_name:   user?.first_name   || '',
    last_name:    user?.last_name    || '',
    phone_number: user?.phone_number || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      await loadUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>My Profile</h1>

        {/* Account info card */}
        <div style={s.infoCard}>
          <div style={s.avatarRow}>
            <div style={s.avatar}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <div style={s.name}>{user?.first_name} {user?.last_name}</div>
              <div style={s.emailText}>{user?.email}</div>
              {user?.is_admin && <span style={s.adminBadge}>Admin</span>}
            </div>
          </div>
          <div style={s.infoGrid}>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Member since</span>
              <strong style={s.infoValue}>{new Date(user?.date_joined).toLocaleDateString('en-IN')}</strong>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Status</span>
              <strong style={{ ...s.infoValue, color: '#4caf50' }}>Active</strong>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Role</span>
              <strong style={s.infoValue}>{user?.is_admin ? 'Administrator' : 'Subscriber'}</strong>
            </div>
          </div>
        </div>

        {/* Edit form card */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Edit Details</h2>
          <form onSubmit={handleSave} style={s.form}>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>First Name</label>
                <input style={s.input} name="first_name" value={form.first_name} onChange={handleChange} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Last Name</label>
                <input style={s.input} name="last_name" value={form.last_name} onChange={handleChange} />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input style={{ ...s.input, opacity: 0.45 }} value={user?.username} disabled />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={{ ...s.input, opacity: 0.45 }} value={user?.email} disabled />
            </div>
            <div style={s.field}>
              <label style={s.label}>Phone Number</label>
              <input
                style={s.input}
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                inputMode="tel"
              />
            </div>
            <button style={s.btn} type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { background: '#060608', minHeight: '100vh', color: '#fff' },
  container: { maxWidth: 680, margin: '0 auto', padding: '40px 16px 60px', display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box' },
  title: { fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 800, margin: '0 0 4px', fontFamily: 'Georgia, serif' },
  infoCard: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 16, padding: '20px 18px' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #1e1e2e' },
  avatar: { width: 56, height: 56, flexShrink: 0, borderRadius: '50%', background: '#7c5cfc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 },
  name: { color: '#fff', fontWeight: 700, fontSize: 17 },
  emailText: { color: '#555', fontSize: 13, marginTop: 3 },
  adminBadge: { background: 'rgba(124,92,252,0.2)', color: '#7c5cfc', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 12, display: 'inline-block', marginTop: 5 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px 20px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: 0.4 },
  infoValue: { color: '#fff', fontSize: 13 },
  card: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 16, padding: '20px 18px' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 18px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#888', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 },
  input: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', WebkitAppearance: 'none' },
  btn: { background: '#7c5cfc', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, width: '100%', touchAction: 'manipulation' },
};