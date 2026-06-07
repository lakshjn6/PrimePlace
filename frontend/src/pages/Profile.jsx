import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loadUser } = useAuth();
  const [form, setForm]   = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
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

        <div style={s.layout}>
          <div style={s.card}>
            <div style={s.avatarArea}>
              <div style={s.avatar}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
              <div>
                <div style={s.name}>{user?.first_name} {user?.last_name}</div>
                <div style={s.email}>{user?.email}</div>
                {user?.is_admin && <span style={s.adminBadge}>Admin</span>}
              </div>
            </div>

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
                <input style={{...s.input, opacity:0.5}} value={user?.username} disabled />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={{...s.input, opacity:0.5}} value={user?.email} disabled />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone Number</label>
                <input style={s.input} name="phone_number" value={form.phone_number} onChange={handleChange} />
              </div>
              <button style={s.btn} type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div style={s.infoCard}>
            <h3 style={s.infoTitle}>Account Info</h3>
            <div style={s.infoRow}><span>Member since</span><strong>{new Date(user?.date_joined).toLocaleDateString('en-IN')}</strong></div>
            <div style={s.infoRow}><span>Status</span><strong style={{color:'#4caf50'}}>Active</strong></div>
            <div style={s.infoRow}><span>Role</span><strong>{user?.is_admin ? 'Administrator' : 'Subscriber'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  container: { maxWidth:900, margin:'0 auto', padding:'48px 24px' },
  title: { fontSize:36, fontWeight:800, marginBottom:36, fontFamily:'Georgia,serif' },
  layout: { display:'grid', gridTemplateColumns:'1fr 280px', gap:28, alignItems:'start' },
  card: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:32 },
  avatarArea: { display:'flex', alignItems:'center', gap:20, marginBottom:32, padding:'0 0 28px', borderBottom:'1px solid #1e1e2e' },
  avatar: { width:72, height:72, borderRadius:'50%', background:'#7c5cfc', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:24 },
  name: { color:'#fff', fontWeight:700, fontSize:20 },
  email: { color:'#555', fontSize:14, marginTop:4 },
  adminBadge: { background:'rgba(124,92,252,0.2)', color:'#7c5cfc', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:12, display:'inline-block', marginTop:6 },
  form: { display:'flex', flexDirection:'column', gap:18 },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { color:'#888', fontSize:12, fontWeight:600, letterSpacing:0.5 },
  input: { background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' },
  btn: { background:'#7c5cfc', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:8 },
  infoCard: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:24, position:'sticky', top:88 },
  infoTitle: { color:'#fff', fontWeight:700, fontSize:18, margin:'0 0 20px', fontFamily:'Georgia,serif' },
  infoRow: { display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #111', color:'#666', fontSize:14 },
};
